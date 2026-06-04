console.log("[GPA Engine] v11.42 - Public - XML/Markdown format toggle, feedback auto-update fix, parser protection...");

(function() {
    window.tailwind = window.tailwind || {};
    tailwind.config = { darkMode: 'class' };

    // --- V11.42 FORMAT CONVERSION UTILITIES ---
    function convertToMarkdown(text) {
        if (!text) return "";
        return text
            .replace(/<\/([a-zA-Z0-9_]+)>/gi, '') // remove closing tags
            .replace(/<([a-zA-Z0-9_]+)[^>]*>/gi, function(match, p1) {
                let title = p1.replace(/_/g, ' ').toUpperCase();
                return '\n## ' + title + '\n';
            })
            .replace(/\n{3,}/g, '\n\n') // reduce multiple blank lines
            .trim();
    }

    function getHighlightedString(line) {
        let safeLine = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return safeLine.replace(/(&lt;\/?)([a-zA-Z0-9_:-]+)(.*?)(&gt;)/g, '<span class="text-slate-400 dark:text-slate-500">$1</span><span class="text-fuchsia-600 dark:text-fuchsia-400 font-semibold">$2</span><span class="text-slate-400 dark:text-slate-500">$3$4</span>');
    }

    function getSentences(text) {
        if (!text) return [];
        const result = [];
        let current = '';
        for (let i = 0; i < text.length; i++) {
            current += text[i];
            if (text[i] === '\n') {
                result.push(current);
                current = '';
            } else if (/[.?!]/.test(text[i])) {
                // If it's punctuation, consume trailing spaces to keep the sentence whole
                if (i === text.length - 1 || /[ \t\n]/.test(text[i+1])) {
                    while (i + 1 < text.length && /[ \t]/.test(text[i+1])) {
                        current += text[++i];
                    }
                    result.push(current);
                    current = '';
                }
            }
        }
        if (current) result.push(current);
        return result;
    }

    function renderDiff(targetEl, currentText, previousText) {
        currentText = currentText || '';
        previousText = previousText || '';
        
        if (!previousText) {
            const currSents = getSentences(currentText);
            let htmlOutput = '';
            for (let i = 0; i < currSents.length; i++) htmlOutput += getHighlightedString(currSents[i]);
            targetEl.innerHTML = htmlOutput;
            return;
        }
        
        const currSents = getSentences(currentText);
        const prevSents = getSentences(previousText);
        const prevSet = new Set(prevSents.map(s => s.trim()).filter(s => s.length > 0));
        
        let htmlOutput = '';
        for (let i = 0; i < currSents.length; i++) {
            const sent = currSents[i];
            const trimmedSent = sent.trim();
            
            if (trimmedSent && !prevSet.has(trimmedSent)) {
                // Isolate leading/trailing spaces and newlines from the green highlight
                const leadingSpaceMatch = sent.match(/^[\s\n]*/);
                const trailingSpaceMatch = sent.match(/[\s\n]*$/);
                const leadingSpace = leadingSpaceMatch ? leadingSpaceMatch[0] : '';
                const trailingSpace = trailingSpaceMatch ? trailingSpaceMatch[0] : '';
                
                const coreText = sent.substring(leadingSpace.length, sent.length - trailingSpace.length);
                htmlOutput += `${leadingSpace}<span class="diff-new">${getHighlightedString(coreText)}</span>${trailingSpace}`;
            } else {
                htmlOutput += getHighlightedString(sent);
            }
        }
        targetEl.innerHTML = htmlOutput;
    }

    function triggerCopy(text, labelEl) {
        const updateLabel = () => {
            if(labelEl) {
                const orig = labelEl.getAttribute('data-orig-text') || labelEl.textContent;
                if (labelEl.textContent !== 'Copied!') labelEl.setAttribute('data-orig-text', orig);
                labelEl.textContent = 'Copied!'; 
                setTimeout(() => labelEl.textContent = orig, 2000); 
            }
        };
        const fallbackCopy = () => {
            const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
            try { document.execCommand('copy'); updateLabel(); } catch (err) {}
            document.body.removeChild(ta);
        };
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(updateLabel).catch(() => fallbackCopy());
        } else {
            fallbackCopy();
        }
    }

    function updateFeedback() {
        let feedback = '';
        document.querySelectorAll('.question-table').forEach((table, index) => {
            const checked = table.querySelector('input[type="radio"]:checked');
            const titleSpan = table.querySelector('.q-title-text');
            const title = titleSpan ? titleSpan.innerText : 'Question ' + (index+1);
            const answer = checked ? (checked.value === 'Other' ? (table.querySelector('.other-input')?.value || '______') : checked.value) : '______';
            feedback += (index + 1) + '. ' + title + ': [ ' + answer + ' ]\n';
        });
        const summaryEl = document.getElementById('feedback-summary');
        if(summaryEl) summaryEl.textContent = feedback.trim() || 'Please select options above.';
    }

    function buildUI() {
        const bootLoader = document.getElementById('initial-boot-loader');
        if (bootLoader) bootLoader.remove();

        const wrapper = document.createElement('div');
        wrapper.className = "flex flex-col h-screen overflow-hidden items-center w-full relative bg-gray-100 dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 transition-colors duration-200";
        
        wrapper.innerHTML = `
        <div id="model-detection-container" class="fixed inset-0 z-[999999] bg-[#131314] flex flex-col items-center justify-center p-8 text-center transition-opacity duration-300" style="display: flex;">
            <div id="loading-state" class="p-10 bg-sky-500/5 dark:bg-sky-900/10 border-2 border-sky-500/30 rounded-3xl shadow-xl w-full max-w-lg" style="display: block;">
                <span class="material-symbols-outlined text-6xl text-sky-500 mb-4 animate-spin block">progress_activity</span>
                <h2 class="text-2xl font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-2">Detecting Model...</h2>
                <p class="text-gray-700 dark:text-gray-300">Verifying architectural fidelity and execution integrity...</p>
            </div>

            <div id="fast-model-blocker" class="p-8 bg-red-500/5 dark:bg-red-900/10 border-2 border-red-500/30 rounded-3xl shadow-xl w-full max-w-2xl hidden" style="display: none;">
                <span class="material-symbols-outlined text-6xl text-red-500 mb-4 animate-pulse">error</span>
                <h2 class="text-2xl font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-2">Fast Model Detected</h2>
                <p class="text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">This tool requires <strong>Gemini 3.1 Pro</strong> for advanced UI generation.</p>
                <p class="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">Activate Pro model and reply "Pro on" to resume optimization. If Pro is not available, uncheck the Canvas tool and answer "text only".</p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-6 text-left">
                    <div class="p-5 bg-red-600 dark:bg-red-500 text-white rounded-2xl shadow-lg border border-red-400">
                        <h4 class="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"><span class="material-symbols-outlined text-[20px]">toggle_on</span> Action: Unlock Pro</h4>
                        <p class="text-xs mb-2 opacity-90">1. Activate <strong>Gemini 3.1 Pro</strong>.</p>
                        <p class="text-xs opacity-90 leading-loose">2. Answer exactly: <button class="action-btn inline-flex items-center gap-1 px-2 py-0.5 bg-black/20 border border-black/20 rounded font-mono text-[11px]" data-action="copy-raw" data-copy-content="Pro on">Pro on</button></p>
                    </div>
                    <div class="p-5 bg-gray-800 text-white rounded-2xl shadow-lg border border-gray-600">
                        <h4 class="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"><span class="material-symbols-outlined text-[20px]">article</span> Action: Text Only</h4>
                        <p class="text-xs mb-2 opacity-90">1. Uncheck the <strong>Canvas tool</strong>.</p>
                        <p class="text-xs opacity-90 leading-loose">2. Answer exactly: <button class="action-btn inline-flex items-center gap-1 px-2 py-0.5 bg-black/20 border border-black/20 rounded font-mono text-[11px]" data-action="copy-raw" data-copy-content="text only">text only</button></p>
                    </div>
                </div>
                
                <button id="proceed-anyway-btn" class="mt-2 px-4 py-2 bg-red-900/50 hover:bg-red-800/80 text-white text-xs font-bold rounded-lg transition-colors border border-red-700/50">Proceed Anyway</button>
            </div>
        </div>

        <div id="main-app-container" class="max-w-[1250px] w-full flex-col h-full bg-[#f0f4f9] dark:bg-[#131314] shadow-2xl border-x border-gray-300 dark:border-gray-800 hidden" style="display: none;">
            <div class="shrink-0 z-50 border-b border-gray-200 dark:border-gray-800 px-4 py-4 md:px-8 shadow-sm">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="flex items-center gap-4">
                        <div class="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                            <span class="material-symbols-outlined text-sky-500 text-[24px]">design_services</span>
                            <span id="ui-gem-name" class="font-black text-lg hidden sm:block">Gemini Prompt Architect</span>
                        </div>
                        <div class="w-px h-6 bg-gray-300 dark:bg-gray-700 hidden sm:block"></div>
                        <div class="flex items-center space-x-4 w-full md:w-auto overflow-x-auto no-scrollbar">
                            <button class="tab-btn tab-active pb-1 px-1 text-sm font-semibold whitespace-nowrap" data-tab="prompt">System Prompt & Feedback</button>
                            <button class="tab-btn pb-1 px-1 text-sm font-semibold text-gray-500 whitespace-nowrap hidden" data-tab="flow" style="display: none;">Visual Flowchart</button>
                            <button class="tab-btn pb-1 px-1 text-sm font-semibold text-gray-500 whitespace-nowrap" data-tab="setup">Setup Instructions</button>
                        </div>
                    </div>
                    <div class="flex items-center justify-end space-x-3 shrink-0">
                        <button class="action-btn flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-800/50 rounded-full transition-all focus:outline-none whitespace-nowrap" data-action="toggle-format">
                            <span class="material-symbols-outlined text-[16px] pointer-events-none">code_blocks</span> <span class="format-label pointer-events-none">XML</span>
                        </button>
                        <button class="action-btn w-9 h-9 flex items-center justify-center bg-teal-600 hover:bg-teal-500 text-white rounded-full transition-all shadow-md focus:outline-none" data-action="download-prompt" title="Download Prompt">
                            <span class="material-symbols-outlined text-[18px] pointer-events-none">download</span>
                        </button>
                        <button class="action-btn flex items-center gap-2 px-4 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-50 text-white rounded-full transition-all shadow-lg focus:outline-none whitespace-nowrap" data-action="copy-prompt">
                            <span class="material-symbols-outlined text-[16px] pointer-events-none">content_copy</span> <span class="copy-label pointer-events-none">Copy Prompt</span>
                        </button>
                        <button class="action-btn w-9 h-9 flex items-center justify-center bg-transparent hover:bg-gray-200 dark:hover:bg-[#282a2c] rounded-full transition-colors focus:outline-none" data-action="theme-toggle" aria-label="Toggle Theme">
                            <span class="theme-icon material-symbols-outlined text-[20px] pointer-events-none">light_mode</span>
                        </button>
                    </div>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto">
                <div class="p-4 md:p-8 pt-4">
                    <div id="app-content-prompt" class="space-y-6 mt-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div class="bg-blue-50/50 dark:bg-sky-900/10 border-2 border-sky-100 dark:border-sky-900/30 rounded-[28px] p-6 md:p-8 shadow-sm flex flex-col">
                                <h3 class="text-lg font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-4 flex items-center gap-3">
                                    <span class="material-symbols-outlined">analytics</span> Executive Summary
                                </h3>
                                <div class="text-sm md:text-base text-gray-700 dark:text-gray-300 flex-grow">
                                    <ul class="list-none space-y-3 mb-6" id="summary-list">
                                        <li><strong class="text-sky-600 dark:text-sky-400">Core Objective:</strong> <span id="summary-ui-container">...</span></li>
                                        <li id="logic-li"><strong class="text-sky-600 dark:text-sky-400">Prompt Logic:</strong> <span id="ui-logic">...</span></li>
                                        <li id="output-li"><strong class="text-sky-600 dark:text-sky-400">Target Output:</strong> <span id="ui-output">...</span></li>
                                    </ul>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-sky-200 dark:border-sky-800 mt-auto">
                                    <div>
                                        <span class="block text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-1">Recommended Model</span>
                                        <span class="font-semibold text-sky-700 dark:text-sky-300" id="ui-model">...</span>
                                    </div>
                                    <div>
                                        <span class="block text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-1">Required Tool</span>
                                        <span class="font-semibold text-sky-700 dark:text-sky-300" id="ui-tool">...</span>
                                    </div>
                                    <div>
                                        <span class="block text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-1">Knowledge Base</span>
                                        <span class="font-semibold text-sky-700 dark:text-sky-300" id="ui-kb-status">Inactive</span>
                                    </div>
                                </div>
                            </div>

                            <div class="bg-indigo-50/50 dark:bg-indigo-900/10 border-2 border-indigo-100 dark:border-indigo-900/30 rounded-[28px] p-6 md:p-8 shadow-sm flex flex-col">
                                <h3 class="text-lg font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-3">
                                    <span class="material-symbols-outlined">update</span> Updates & Upgrades
                                </h3>
                                <div class="text-sm md:text-base text-gray-700 dark:text-gray-300 flex-grow">
                                    <p class="mb-3 font-bold text-indigo-500" id="ui-update-title"></p>
                                    <ul class="list-disc pl-5 space-y-2" id="ui-updates-list"></ul>
                                </div>
                            </div>
                        </div>

                        <hr class="border-sky-200 dark:border-sky-800/50 my-8">
                        
                        <h3 class="text-lg font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-4 flex items-center gap-3">
                            <span class="material-symbols-outlined">tune</span> Surgical Questions
                        </h3>
                        <div id="ui-questions-container" class="space-y-6"></div>

                        <div class="mt-8 bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
                            <div class="flex items-center justify-start gap-4 mb-3">
                                <h4 class="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                                    <span class="material-symbols-outlined text-sky-500 text-[18px]">chat</span> Feedback Summary
                                </h4>
                                <button class="action-btn flex items-center gap-1 px-3 py-1 text-xs font-bold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded transition-colors focus:outline-none" data-action="copy-answers">
                                    <span class="material-symbols-outlined text-[14px] pointer-events-none">content_copy</span> <span class="pointer-events-none copy-answers-label">Copy Answers</span>
                                </button>
                            </div>
                            <div id="feedback-summary" class="font-mono text-[11px] text-slate-600 dark:text-slate-400 outline-none whitespace-pre-wrap p-3 bg-gray-50 dark:bg-[#18191a] rounded" contenteditable="false">Please select options above.</div>
                        </div>

                        <div class="flex flex-col md:flex-row gap-6 md:h-[750px] mt-8">
                            <div class="flex-[1.4] min-w-[320px] bg-white dark:bg-[#1e1f20] rounded-[28px] p-6 shadow-xl border border-gray-200 dark:border-gray-700/50 flex flex-col overflow-hidden">
                                <div class="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 shrink-0">
                                    <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Optimized Prompt</h3>
                                    <div id="version-controls" class="items-center gap-1 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-lg" style="display: flex;">
                                        <button id="v-prev-btn" class="action-btn flex items-center justify-center w-6 h-6 rounded transition-colors text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700">
                                            <span class="material-symbols-outlined text-[16px] pointer-events-none">chevron_left</span>
                                        </button>
                                        <span id="v-display-label" class="text-[10px] font-bold px-2 text-slate-700 dark:text-slate-300 min-w-[40px] text-center">...</span>
                                        <button id="v-next-btn" class="action-btn flex items-center justify-center w-6 h-6 rounded transition-colors text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700">
                                            <span class="material-symbols-outlined text-[16px] pointer-events-none">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                                <div id="prompt-ui-container" class="custom-scrollbar outline-none whitespace-pre-wrap text-[13px] leading-relaxed text-gray-800 dark:text-gray-200 overflow-auto flex-grow font-mono">
                                </div>
                            </div>
                            
                            <div id="path-b-kb" class="hidden flex-1 min-w-[320px] bg-gray-50 dark:bg-[#18191a] rounded-[28px] p-6 shadow-inner border border-gray-200 dark:border-gray-700/50 flex-col">
                                <div class="flex flex-col h-full">
                                    <h3 class="text-base font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-4 border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center gap-2">
                                        <span class="material-symbols-outlined text-[20px]">folder_zip</span> Gem Knowledge Base
                                    </h3>
                                    <div class="custom-scrollbar overflow-auto flex-grow">
                                        <p class="mb-5 text-sm italic opacity-80 text-gray-500">Download or copy these templates to upload to your Gem.</p>
                                        <div id="ui-kb-templates-container"></div>
                                    </div>
                                </div>
                            </div>

                            <div id="path-a-preview" class="hidden flex-1 min-w-[320px] bg-gray-50 dark:bg-[#18191a] rounded-[28px] p-6 shadow-inner border border-gray-200 dark:border-gray-700/50 flex-col">
                                <h3 class="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[18px]">visibility</span> Standard Execution
                                </h3>
                                <div class="text-sm text-gray-700 dark:text-gray-400 flex-grow leading-relaxed">
                                    This is a standard prompt intended for immediate execution in the chat window, not a Custom Gem. Copy the prompt from the left panel and paste it into a new chat.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="app-content-flow" class="hidden animate-in fade-in duration-500">
                        <div class="flex flex-col items-center pt-8 w-full max-w-4xl mx-auto space-y-4"></div>
                    </div>

                    <div id="app-content-setup" class="hidden animate-in fade-in duration-500 pb-12">
                        <div class="max-w-2xl mx-auto bg-white dark:bg-[#1e1f20] rounded-[28px] p-8 border border-gray-200 dark:border-gray-700 shadow-xl mt-8">
                            <h3 class="text-xl font-bold mb-6 flex items-center gap-3 text-sky-500"><span class="material-symbols-outlined">rocket_launch</span> Deployment Guide</h3>
                            <div class="space-y-6 text-sm text-gray-700 dark:text-gray-300">
                                
                                <div id="setup-option-a" class="hidden">
                                    <h4 class="font-bold text-slate-400 text-[13px] uppercase tracking-widest mt-8 mb-2 border-b border-gray-100 dark:border-gray-800 pb-2">Standard Prompt Execution</h4>
                                    <div class="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl mb-4 shadow-sm">
                                        <span class="font-bold text-emerald-500 block mb-1 underline text-[13px]">Step 1: Copy Prompt</span>
                                        Copy the optimized prompt from the editor panel.
                                    </div>
                                    <div class="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl mt-4 shadow-sm">
                                        <span class="font-bold text-emerald-500 block mb-1 underline text-[13px]">Step 2: Execute</span>
                                        Paste it into a fresh chat with Gemini and execute it to see the magic.
                                    </div>
                                </div>

                                <div id="setup-option-b" class="hidden">
                                    <h4 class="font-bold text-slate-400 text-[13px] uppercase tracking-widest mt-8 mb-2 border-b border-gray-100 dark:border-gray-800 pb-2">Custom Gem Setup</h4>
                                    <div class="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl mb-4 shadow-sm">
                                        <span class="font-bold text-sky-500 block mb-1 underline text-[13px]">Step 1: Gem Creation</span>
                                        Navigate to the <strong>Gem manager menu</strong> by clicking on the <strong>Gems</strong> bar in the sidebar and click on <span class="inline-block bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-400 px-2 py-1 rounded font-mono text-[11px]">+ New Gem</span>.
                                    </div>
                                    <div class="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 shadow-sm">
                                        <div>
                                            <span class="font-bold text-sky-500 block mb-1 underline text-[13px]">Step 2: Name the Gem</span>
                                            <span id="setup-gem-name" class="font-mono text-[13px]">...</span>
                                        </div>
                                        <button class="action-btn flex items-center gap-1 px-3 py-1.5 text-[13px] font-bold bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 hover:bg-sky-200 rounded transition-colors" data-action="copy-text" data-text-target="setup-gem-name">
                                            <span class="material-symbols-outlined text-[14px] pointer-events-none">content_copy</span> <span class="copy-label pointer-events-none">Copy Name</span>
                                        </button>
                                    </div>
                                    <div class="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 shadow-sm">
                                        <div>
                                            <span class="font-bold text-sky-500 block mb-1 underline text-[13px]">Step 3: Describe the Gem</span>
                                            <span id="setup-gem-desc" class="text-[13px] italic">...</span>
                                        </div>
                                        <button class="action-btn flex items-center gap-1 px-3 py-1.5 text-[13px] font-bold bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 hover:bg-sky-200 rounded transition-colors" data-action="copy-text" data-text-target="setup-gem-desc">
                                            <span class="material-symbols-outlined text-[14px] pointer-events-none">content_copy</span> <span class="copy-label pointer-events-none">Copy Desc</span>
                                        </button>
                                    </div>
                                    <div class="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 shadow-sm">
                                        <div>
                                            <span class="font-bold text-sky-500 block mb-1 underline text-[13px]">Step 4: Gem Instructions</span>
                                            Copy prompt and paste it into the <strong>Gem Instructions</strong> field.
                                        </div>
                                        <button class="action-btn flex items-center gap-1 px-3 py-1.5 text-[13px] font-bold bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 hover:bg-sky-200 rounded transition-colors" data-action="copy-prompt">
                                            <span class="material-symbols-outlined text-[14px] pointer-events-none">content_copy</span> <span class="copy-label pointer-events-none">Copy Prompt</span>
                                        </button>
                                    </div>
                                    <div class="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl mt-4 shadow-sm">
                                        <span class="font-bold text-sky-500 block mb-1 underline text-[13px]">Step 5: Tool Selection</span>
                                        In the Gem setup page, select <strong id="setup-tool-name">Canvas UI</strong> from the tools dropdown.
                                    </div>
                                    <div class="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl mt-4 shadow-sm" id="setup-step-6">
                                        <span class="font-bold text-sky-500 block mb-1 underline text-[13px]">Step 6: Knowledge Database</span>
                                        <span class="text-[13px]">Download the required HTML templates from the Knowledge Base tab and upload them to your Gem.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        
        document.body.appendChild(wrapper);

        const style = document.createElement('style');
        style.innerHTML = '.diff-new { background-color: rgba(16, 185, 129, 0.15); color: #6ee7b7; border-radius: 4px; padding: 0 2px; display: inline-block; }';
        document.head.appendChild(style);
    }

    function decodeMacro(text) {
        if (typeof text !== 'string') return text;
        return text.replace(/\[\[CLOSING_SCRIPT\]\]/gi, '</' + 'script>')
           .replace(/\[\[BACKTICK\]\]/g, '`')
           .replace(/\[\[LESS_THAN\]\]/g, '<')
           .replace(/\[\[GREATER_THAN\]\]/g, '>')
           .replace(/\[\[QUOTE\]\]/g, '"')
           .replace(/\[\[MACRO_PERSONA_DEFS\]\]/g, GPA_STATIC_DICTIONARY.PERSONA_DEFS)
           .replace(/\[\[MACRO_ROUTING_DETAILS\]\]/g, GPA_STATIC_DICTIONARY.ROUTING_DETAILS)
           .replace(/\[\[MACRO_ARTIFACT_TEMPLATE\]\]/g, GPA_STATIC_DICTIONARY.ARTIFACT_TEMPLATE)
           .replace(/\[\[MACRO_AIRBUS_MANDATES\]\]/g, GPA_STATIC_DICTIONARY.AIRBUS_MANDATES)
           .replace(/\[\[MACRO_TEST_TEXT\]\]/g, GPA_STATIC_DICTIONARY.TEST_TEXT);
    }

    function recursiveDecode(obj) {
        if (typeof obj === 'string') return decodeMacro(obj);
        if (Array.isArray(obj)) return obj.map(recursiveDecode);
        if (obj !== null && typeof obj === 'object') {
            for (let key in obj) { obj[key] = recursiveDecode(obj[key]); }
        }
        return obj;
    }

    function reconstructPromptStateBackward(versionsArray, targetIndex) {
        if (!versionsArray || versionsArray.length === 0) return "";
        let targetVersion = versionsArray[targetIndex];

        const promptNode = document.getElementById('current-prompt-payload') || document.getElementById('raw-prompt-payload');
        
        if (promptNode) {
            const explicitVersion = promptNode.getAttribute('data-version');
            let anchorIndex = versionsArray.length - 1;
            if (explicitVersion) {
                const foundIndex = versionsArray.findIndex(v => v.id === explicitVersion);
                if (foundIndex !== -1) anchorIndex = foundIndex;
            }

            let compiledState = decodeMacro(promptNode.textContent || promptNode.innerHTML || "");
            if (targetIndex === anchorIndex) return compiledState;

            for (let i = anchorIndex - 1; i >= targetIndex; i--) {
                let pastVersion = versionsArray[i];
                let patchNodes = document.querySelectorAll(`.gpa-history-node[data-version="${pastVersion.id}"]`);
                
                patchNodes.forEach(node => {
                    let blockName = node.getAttribute('data-block');
                    let oldTextToRestore = node.textContent ? decodeMacro(node.textContent) : "";
                    
                    if (blockName) {
                        if (blockName.toLowerCase() === 'root' || blockName.toLowerCase() === 'full_draft') {
                            compiledState = oldTextToRestore;
                        } else {
                            let blockRegex = new RegExp(`(<${blockName}[^>]*>)([\\s\\S]*?)(<\\/${blockName}>)`, "i");
                            if (blockRegex.test(compiledState)) {
                                compiledState = compiledState.replace(blockRegex, `$1\n${oldTextToRestore}\n$3`);
                            }
                        }
                    }
                });
            }
            return compiledState;
        }

        const usesReversePatches = versionsArray.some(v => v.reversePatches);
        if (usesReversePatches) {
            const anchorIndex = versionsArray.length - 1;
            let compiledState = versionsArray[anchorIndex].content ? decodeMacro(versionsArray[anchorIndex].content) : "";
            if (targetIndex === anchorIndex) return compiledState;

            for (let i = anchorIndex - 1; i >= targetIndex; i--) {
                let pastVersion = versionsArray[i];
                if (pastVersion.reversePatches) {
                    pastVersion.reversePatches.forEach(patch => {
                        let blockName = patch.targetBlock ? patch.targetBlock.toLowerCase() : "";
                        let oldText = patch.restoreContent ? decodeMacro(patch.restoreContent) : "";
                        if (blockName) {
                            let blockRegex = new RegExp(`(<${blockName}[^>]*>)([\\s\\S]*?)(<\\/${blockName}>)`, "i");
                            if (blockRegex.test(compiledState)) {
                                compiledState = compiledState.replace(blockRegex, `$1\n${oldText}\n$3`);
                            }
                        }
                    });
                }
            }
            return compiledState;
        }

        const usesForwardPatches = versionsArray.some(v => v.patches);
        if (usesForwardPatches) {
            let compiledState = versionsArray[0].content ? decodeMacro(versionsArray[0].content) : "";
            for (let i = 1; i <= targetIndex; i++) {
                let curr = versionsArray[i];
                if (curr.content) {
                    compiledState = decodeMacro(curr.content);
                } else if (curr.patches) {
                    curr.patches.forEach(patch => {
                        let blockName = patch.targetBlock ? patch.targetBlock.toLowerCase() : "";
                        let newText = patch.newContent ? decodeMacro(patch.newContent) : "";
                        if (blockName) {
                            let blockRegex = new RegExp(`(<${blockName}[^>]*>)([\\s\\S]*?)(<\\/${blockName}>)`, "i");
                            if (blockRegex.test(compiledState)) {
                                compiledState = compiledState.replace(blockRegex, `$1\n${newText}\n$3`);
                            } else {
                                compiledState += `\n<${blockName}>\n${newText}\n</${blockName}>\n`;
                            }
                        }
                    });
                }
            }
            return compiledState;
        }

        if (targetVersion.content) return decodeMacro(targetVersion.content);
        if (targetVersion.delta) return `[LEGACY DELTA SUMMARY - FULL TEXT UNAVAILABLE]\n\n${targetVersion.delta}`;
        
        return "";
    }

    function initApp() {
        console.log("[GPA Engine] initApp() executing v11.42 logic.");

        const stateElement = document.getElementById('app-state');
        let appState = {};
        if (stateElement) {
            try { 
                appState = JSON.parse(stateElement.textContent.replace(/\u00A0/g, ' ')); 
            } catch (err) { 
                console.error("Failed to parse #app-state JSON. Proceeding with empty state to prevent hard crash.");
            }
        }

        appState.meta = appState.meta || {};
        window.isMarkdownFormat = false;

        const GPA_STATIC_DICTIONARY = {
            PERSONA_DEFS: `
      - **Technical Mode (Default):** Use for coding, data analysis, business logic, or structured workflows. Persona: "The Prompt Engineer," the elite Prompt Optimizer. Language: Precise, mission-oriented. **Associated Model:** Gemini 3.1 Pro.
      - **Creative Mode:** Use for creative writing, storytelling, art generation, or marketing copy. Persona: "The Creator," an inspiring guide. Language: Evocative, story-focused. **UI Override:** Rename HTML headers: "Executive Summary" to "Current Vision", "Updates & Upgrades" to "Creative Upgrades", and "Surgical Questions" to "Refining the Vision". **Associated Model:** Gemini 3 Deep Think.
      - **Educational Mode:** Use if the user asks for explanations, wants to learn prompt engineering, or asks "why/how". Persona: "The Tutor," a Socratic instructor. Language: Inquisitive. **Unique Feature:** Every suggestion must be followed by a **Reasoning:** block explaining the prompt engineering principle behind it. **Associated Model:** Gemini 3 Deep Think.`,
                  
            ROUTING_DETAILS: `
  **INITIALIZATION & ROUTING:**

  **RULE 1: THE SHORT GREETING (TURN 1 ONLY)**
  IF TURN == 1 AND user input is < 5 words AND != "GPA update":
  -> ACTION: OUTPUT EXACTLY THIS STATIC GREETING:
     "Hi! I am the Gemini Prompt Architect, your proactive AI coach.\\n\\nMy purpose is to help clarify your intent and architect it into a highly optimized Meta-Prompt to achieve your goals.\\n\\nHere is our game plan:\\n> 1. Tell me what you are trying to achieve or build.\\n> 2. I will ask a few quick questions to understand your exact context.\\nI have initialized the GPA interface we will use to optimize your prompt interactively.\\n\\nNote: Please make sure Gemini Pro is activated for optimal prompt optimization and UI rendering"
  -> TERMINATE.

  **RULE 2: SYSTEM UPDATE ("GPA update")**
  IF user message contains "GPA update":
  -> ACTION: Treat your internal GPA instructions/core logic as the prompt to be optimized. Execute Path 1.

  **RULE 3: MODE SWITCHING (Turn > 1)**
  IF user message == "Pro on" OR "text only":
  -> ACTION: Set "proOverride": true in JSON schema. Optimize the PREVIOUSLY submitted draft.
  -> IF "Pro on" -> Execute Path 1.
  -> IF "text only" -> Execute Path 2.

  **RULE 4: STANDARD OPTIMIZATION**
  IF none of the above specific cases match:
  -> ACTION: Execute Path 1 (Canvas Mode - Default for 5+ word drafts).`,
                  
            ARTIFACT_TEMPLATE: `\`\`\`html:GPA Output:GPA_Unified_vX.X.html
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GPA Optimizer</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
</head>
<body class="bg-gray-100 dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 transition-colors duration-200 flex flex-col h-screen overflow-hidden items-center w-full relative">
    <div id="initial-boot-loader" class="fixed inset-0 z-50 flex items-center justify-center bg-[#131314] text-sky-500 font-mono text-sm animate-pulse">
        [INITIALIZING GPA ARCHITECTURE...]
    </div>
    <script type="application/json" id="app-state"><\/script>
    <script type="text/plain" id="current-prompt-payload"><\/script>
    <script>
        (function() {
            var primarySrc = "https://github.airbus.corp/pages/Airbus/gpa-engine/gpa-engine.js";
            var backupSrc = "https://jamesgaye-gems.github.io/gpa-engine/gpa-engine.js";
            var s = document.createElement('script');
            s.src = primarySrc;
            s.onerror = function() {
                var b = document.createElement('script');
                b.src = backupSrc;
                b.crossOrigin = "anonymous";
                document.body.appendChild(b);
            };
            document.body.appendChild(s);
        })();
    <\/script>
</body>
</html>
\`\`\`eof`,

            AIRBUS_MANDATES: `
  **UNIFIED AIRBUS PROMPT MANDATES & NEURO-SAFETY GUIDELINES:**

  **1. Neuro-Safety & Content Governance:**
  - **Protocol C (Synthesis First):** Protect human cognitive bandwidth by ALWAYS providing an "Executive Synthesis" summarizing the output before detailed generation.
  - **Content Scale Enforcement:** Explicitly mark raw, unverified AI generation as "CLASSIFICATION: L4 - Raw Synthetic Content". If a document combines material from different levels, classify at the highest risk level.

  **2. The Structural Blueprint (OPRO):**
  - **5-Part Skeleton:** All prompts must strictly utilize: (1) Role, (2) Goal, (3) Context & Exemplars (including 2-3 examples of perfect logic), (4) Constraints, and (5) Clarity Check.
  - **Context-First Rule:** Raw data and context must ALWAYS precede instructions.
  - **XML Isolation:** External code and passive data must be isolated within [[LESS_THAN]]source_material[[GREATER_THAN]] tags to prevent prompt injection.

  **3. Advanced Risk Mitigations:**
  - **Evidence Extraction:** To prevent hallucinations, the AI must cite literal quotes (for text) or unigram counts (for data) from the source material before synthesizing.
  - **The Conflict Report (Adversarial Audit):** The AI must explicitly list missing information or contradictions between files instead of providing a "harmonized" but incorrect answer.
  - **Truth Hierarchy:** Establish explicit weighting logic for complex data (e.g., "Level 1 Directives override Level 2 Primary Source").
  - **The Clarity Gate:** Conclude prompts with a mandate instructing the AI to identify potential failure modes and ask targeted questions if the user's intent is ambiguous.`,

            TEST_TEXT: `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.`
        };

        buildUI();

        const reflexOut = appState.meta?.reflexOutput?.toString().trim().toUpperCase() || 
                          appState.reflexOutput?.toString().trim().toUpperCase() || 
                          "";

        const isProOverride = appState.meta?.proOverride === true || appState.proOverride === true || appState.meta?.proOverride === "true" || appState.proOverride === "true";

        if ((reflexOut !== "HI" && !(reflexOut >= 490 && reflexOut <= 510)) && !isProOverride) {
            const mdc = document.getElementById('model-detection-container');
            if (mdc) {
                const loader = document.getElementById('loading-state');
                const blocker = document.getElementById('fast-model-blocker');
                if (loader) loader.style.display = 'none';
                if (blocker) { blocker.classList.remove('hidden'); blocker.style.display = 'block'; }
                
                document.addEventListener('click', ev => {
                    const btn = ev.target.closest('.action-btn');
                    if (btn && btn.dataset.action === 'copy-raw') {
                        triggerCopy(btn.getAttribute('data-copy-content'), btn.querySelector('.copy-label'));
                    }
                    if (ev.target.id === 'proceed-anyway-btn') {
                        if (blocker) blocker.style.display = 'none';
                        if (mdc) { mdc.style.opacity = '0'; setTimeout(() => mdc.style.display = 'none', 300); }
                        const mainApp = document.getElementById('main-app-container');
                        if (mainApp) { mainApp.classList.remove('hidden'); mainApp.style.display = 'flex'; }
                    }
                });
            }
            return; 
        }

        let parsedVersions = appState.versions || [];
        
        const hasHistoryNodes = document.querySelectorAll('.gpa-history-node').length > 0;
        const hasReversePatches = parsedVersions.some(v => v.reversePatches);
        const hasForwardPatches = parsedVersions.some(v => v.patches);

        if (!hasHistoryNodes && !hasReversePatches && !hasForwardPatches) {
            let rebuiltVersions = [];
            const rawDraft = document.getElementById('raw-draft-payload');
            const prevPrompt = document.getElementById('previous-prompt-payload');
            const currPrompt = document.getElementById('raw-prompt-payload') || document.getElementById('current-prompt-payload');

            if (rawDraft && rawDraft.textContent.trim()) {
                rebuiltVersions.push({ id: "v1.0 (Draft)", content: rawDraft.textContent });
            }
            if (prevPrompt && prevPrompt.textContent.trim()) {
                rebuiltVersions.push({ id: "Previous", content: prevPrompt.textContent });
            }
            
            let currentId = parsedVersions.length > 0 ? parsedVersions[parsedVersions.length - 1].id : "Current";
            if (currPrompt && currPrompt.textContent.trim()) {
                rebuiltVersions.push({ id: currentId, content: currPrompt.textContent });
            } else if (parsedVersions.length > 0) {
                rebuiltVersions.push(parsedVersions[parsedVersions.length - 1]);
            }

            if (rebuiltVersions.length > 0) {
                parsedVersions = rebuiltVersions;
            }
        }
        
        window.versions = parsedVersions;

        document.title = `${appState.meta.gemName || 'GPA'} ${appState.meta.version || ''}`;
        document.getElementById('ui-gem-name').textContent = appState.meta.gemName || "Gemini Prompt Architect";
        
        if (appState.executiveSummary) {
            document.getElementById('summary-ui-container').textContent = appState.executiveSummary;
            const uiLogic = document.getElementById('ui-logic');
            if (uiLogic) uiLogic.textContent = appState.meta.promptLogic || "N/A";
            const uiOutput = document.getElementById('ui-output');
            if (uiOutput) uiOutput.textContent = appState.meta.targetOutput || "N/A";
        }

        document.getElementById('ui-model').textContent = appState.meta.recommendedModel || "Gemini 3.1 Pro";
        document.getElementById('ui-tool').textContent = appState.meta.requiredTool || "Canvas UI";
        document.getElementById('setup-gem-name').textContent = appState.meta.gemName || "Optimized Gem";
        document.getElementById('setup-gem-desc').textContent = appState.meta.coreObjective || "Optimized instructions";

        const execPath = appState.meta.executionPath || "B";
        const optA = document.getElementById('setup-option-a');
        const optB = document.getElementById('setup-option-b');
        const pathA = document.getElementById('path-a-preview');
        const pathB = document.getElementById('path-b-kb');

        if (optA) optA.style.display = execPath === 'A' ? 'block' : 'none';
        if (optB) optB.style.display = execPath === 'B' ? 'block' : 'none';
        
        if (pathA) {
            if (execPath === 'A') { pathA.classList.remove('hidden'); pathA.style.display = 'flex'; }
            else { pathA.classList.add('hidden'); pathA.style.display = 'none'; }
        }
        if (pathB) {
            if (execPath === 'B') { pathB.classList.remove('hidden'); pathB.style.display = 'flex'; }
            else { pathB.classList.add('hidden'); pathB.style.display = 'none'; }
        }

        const kbContainer = document.getElementById('ui-kb-templates-container');
        const kbKeys = appState.kbTemplates ? Object.keys(appState.kbTemplates) : [];
        const kbStatus = document.getElementById('ui-kb-status');
        if (kbStatus) kbStatus.textContent = kbKeys.length > 0 ? `Active (${kbKeys.length} File${kbKeys.length > 1 ? 's' : ''})` : `Inactive (0 Files)`;

        if (kbContainer) {
            kbContainer.innerHTML = ''; 
            if (kbKeys.length > 0) {
                kbKeys.forEach((filename) => {
                    const kbDiv = document.createElement('div');
                    kbDiv.className = "mb-6 p-4 bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm";
                    kbDiv.innerHTML = `
                        <div class="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                            <h4 class="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                                <span class="material-symbols-outlined text-teal-500 text-[24px]">html</span>
                                <div><span class="block">${filename}</span></div>
                            </h4>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <button class="action-btn px-3 py-1.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 hover:bg-teal-200 rounded-lg text-[11px] font-bold flex items-center gap-1" data-action="copy-kb" data-kb-key="${filename}">
                                <span class="material-symbols-outlined text-[14px]">content_copy</span> <span class="copy-label">Copy HTML</span>
                            </button>
                            <button class="action-btn px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1" data-action="download-kb" data-kb-key="${filename}">
                                <span class="material-symbols-outlined text-[14px]">download</span> Download
                            </button>
                            <button class="action-btn px-3 py-1.5 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 hover:bg-sky-200 rounded-lg text-[11px] font-bold flex items-center gap-1" data-action="open-kb" data-kb-key="${filename}">
                                <span class="material-symbols-outlined text-[14px]">open_in_new</span> Open
                            </button>
                        </div>
                    `;
                    kbContainer.appendChild(kbDiv);
                });
            } else {
                 kbContainer.innerHTML = '<p class="text-[13px] text-gray-500">No KB templates generated for this iteration.</p>';
            }
        }

        const setupStep6 = document.getElementById('setup-step-6');
        if (setupStep6 && kbKeys.length === 0) {
            setupStep6.innerHTML = '<span class="font-bold text-sky-500 block mb-1 underline text-[13px]">Step 6: Knowledge Database</span><span class="text-[13px]">No KB templates generated for this iteration.</span>';
        }

        const updatesList = document.getElementById('ui-updates-list');
        if (appState.updates && updatesList) {
            appState.updates.forEach(u => {
                const li = document.createElement('li'); li.innerHTML = u; updatesList.appendChild(li);
            });
        }

        const qContainer = document.getElementById('ui-questions-container');
        if (qContainer && Array.isArray(appState.questions)) {
            appState.questions.forEach((q, idx) => {
                const qDiv = document.createElement('div');
                qDiv.className = "bg-white dark:bg-[#1e1f20] p-5 rounded-xl border border-gray-200 dark:border-gray-700 question-table mb-6";
                let optionsHtml = '';
                if (q.options) {
                    q.options.forEach((opt, oIdx) => {
                        const optId = `q${idx}-opt${oIdx}`;
                        optionsHtml += `
                            <tr class="bg-white dark:bg-slate-900 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800">
                                <td class="border border-gray-300 dark:border-gray-700 p-3 align-top">
                                    <div class="flex items-start gap-3">
                                        <input type="radio" id="${optId}" name="q${idx}" value="${opt.value}" class="mt-1 cursor-pointer accent-sky-500 shrink-0">
                                        <div>
                                            <label for="${optId}" class="cursor-pointer font-bold text-sky-600 dark:text-sky-400 text-[13px] md:text-sm block mb-1">${opt.label}</label>
                                            <p class="text-sm text-slate-500 dark:text-slate-400">${opt.desc}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="border border-gray-300 dark:border-gray-700 p-3 text-[13px] leading-relaxed align-top">
                                    <ul class="list-disc pl-4 space-y-1">
                                        <li><span class="text-emerald-500 font-bold">Pro:</span> ${opt.pro}</li>
                                        <li><span class="text-rose-500 font-bold">Con:</span> ${opt.con}</li>
                                    </ul>
                                </td>
                            </tr>`;
                    });
                }
                qDiv.innerHTML = `<div class="mb-3 px-1"><h4 class="font-bold text-slate-800 dark:text-slate-200">${idx + 1}. <span class="q-title-text">${q.question || q.title}</span></h4><p class="text-sm text-slate-600 dark:text-slate-400 mb-4">${q.context || ''}</p></div><div class="overflow-x-auto"><table class="w-full border-collapse">${optionsHtml}</table></div>`;
                qContainer.appendChild(qDiv);
            });
        }

        window.currentVersionIndex = Math.max(0, window.versions.length - 1);
        
        window.updateVersionUI = function() {
            const vPrev = document.getElementById('v-prev-btn');
            const vNext = document.getElementById('v-next-btn');
            const vLabel = document.getElementById('v-display-label');
            
            if (vPrev) vPrev.disabled = window.currentVersionIndex <= 0;
            if (vNext) vNext.disabled = window.currentVersionIndex >= window.versions.length - 1;
            
            if (vLabel && window.versions[window.currentVersionIndex]) {
                vLabel.textContent = window.versions[window.currentVersionIndex].id || `v${window.currentVersionIndex + 1}`;
            }
            
            const promptEl = document.getElementById('prompt-ui-container') || document.getElementById('gem-instructions');
            if (!promptEl) return;
            
            let currentData = reconstructPromptStateBackward(window.versions, window.currentVersionIndex);
            let previousData = window.currentVersionIndex > 0 ? reconstructPromptStateBackward(window.versions, window.currentVersionIndex - 1) : null;
            
            if (window.isMarkdownFormat) {
                currentData = convertToMarkdown(currentData);
                if (previousData) previousData = convertToMarkdown(previousData);
            }
            
            renderDiff(promptEl, currentData, previousData);
        };
        
        window.updateVersionUI();

        document.addEventListener('change', e => { if(e.target.matches('input[type="radio"], .other-input')) updateFeedback(); }, true);
        document.addEventListener('keyup', e => { if(e.target.matches('input[type="radio"], .other-input')) updateFeedback(); }, true);

        document.addEventListener('click', e => {
            if (e.target.closest('#v-prev-btn')) { 
                if (window.currentVersionIndex > 0) { window.currentVersionIndex--; window.updateVersionUI(); } 
                return; 
            }
            if (e.target.closest('#v-next-btn')) { 
                if (window.currentVersionIndex < window.versions.length - 1) { window.currentVersionIndex++; window.updateVersionUI(); } 
                return; 
            }
            
            const btn = e.target.closest('.action-btn');
            if (!btn) return;
            
            const action = btn.getAttribute('data-action');

            if (action === 'toggle-format') {
                window.isMarkdownFormat = !window.isMarkdownFormat;
                btn.querySelector('.format-label').textContent = window.isMarkdownFormat ? 'Markdown' : 'XML';
                btn.querySelector('.material-symbols-outlined').textContent = window.isMarkdownFormat ? 'subject' : 'code_blocks';
                window.updateVersionUI();
                return;
            }
            
            if (action === 'copy-prompt' || action === 'download-prompt') {
                let content = reconstructPromptStateBackward(window.versions, window.currentVersionIndex);
                if (window.isMarkdownFormat) content = convertToMarkdown(content);
                
                if (action === 'copy-prompt') {
                    triggerCopy(content, btn.querySelector('.copy-label'));
                }
                
                if (action === 'download-prompt') {
                    const blob = new Blob([content], { type: 'text/markdown' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `Optimized_Prompt_${window.versions[window.currentVersionIndex].id}.md`;
                    a.click();
                }
            }
            
            if (action === 'copy-answers') {
                triggerCopy(document.getElementById('feedback-summary').textContent, btn.querySelector('.copy-answers-label'));
            }
            
            if (action === 'copy-text') {
                triggerCopy(document.getElementById(btn.getAttribute('data-text-target')).textContent, btn.querySelector('.copy-label'));
            }
            
            if (action === 'copy-raw') {
                triggerCopy(btn.getAttribute('data-copy-content'), btn.querySelector('.copy-label'));
            }
            
            if (action === 'copy-kb' || action === 'download-kb' || action === 'open-kb') {
                const key = btn.getAttribute('data-kb-key');
                let htmlContent = appState.kbTemplates ? appState.kbTemplates[key] : null;
                if (!htmlContent) return;

                if(action === 'copy-kb') {
                    triggerCopy(htmlContent, btn.querySelector('.copy-label'));
                } else if (action === 'download-kb') {
                    const blob = new Blob([htmlContent], { type: 'text/html' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob); 
                    a.download = key; 
                    a.click();
                } else if (action === 'open-kb') {
                    const newWindow = window.open();
                    if (newWindow) { 
                        newWindow.document.open(); 
                        newWindow.document.write(htmlContent); 
                        newWindow.document.close(); 
                    }
                }
            }
            
            if (action === 'theme-toggle') {
                document.documentElement.classList.toggle('dark');
            }
        });

        const mdc = document.getElementById('model-detection-container');
        if (mdc) { 
            mdc.style.opacity = '0'; 
            setTimeout(() => mdc.style.display = 'none', 300); 
        }
        const mainApp = document.getElementById('main-app-container');
        if (mainApp) { 
            mainApp.classList.remove('hidden'); 
            mainApp.style.display = 'flex'; 
        }
    }

    if (document.readyState === 'loading') { 
        document.addEventListener('DOMContentLoaded', initApp); 
    } else { 
        initApp(); 
    }
})();
