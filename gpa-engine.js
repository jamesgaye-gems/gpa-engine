console.log("[GPA Engine] v11.16 - Semantic Diff Tracking & UI Binding Patches...");

(function() {
    window.tailwind = window.tailwind || {};
    tailwind.config = { darkMode: 'class' };

    function getHighlightedString(line) {
        let safeLine = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return safeLine.replace(/(&lt;\/?)([a-zA-Z0-9_:-]+)(.*?)(&gt;)/g, '<span class="text-slate-400 dark:text-slate-500">$1</span><span class="text-fuchsia-600 dark:text-fuchsia-400 font-semibold">$2</span><span class="text-fuchsia-400 dark:text-fuchsia-300">$3</span><span class="text-slate-400 dark:text-slate-500">$4</span>');
    }

    function renderDiff(targetEl, currentText, previousText) {
        currentText = currentText || '';
        previousText = previousText || '';
        
        if (!previousText) {
            const currLines = currentText.split('\n');
            let htmlOutput = '';
            for (let i = 0; i < currLines.length; i++) htmlOutput += getHighlightedString(currLines[i]) + '\n';
            targetEl.innerHTML = htmlOutput;
            return;
        }
        const currLines = currentText.split('\n');
        const prevLines = previousText.split('\n');
        const prevSet = new Set(prevLines.map(l => l.trim()));
        let htmlOutput = '';
        for (let i = 0; i < currLines.length; i++) {
            const line = currLines[i];
            const highlighted = getHighlightedString(line);
            if (line.trim() && !prevSet.has(line.trim())) {
                htmlOutput += `<span class="diff-new">${highlighted}</span>\n`;
            } else {
                htmlOutput += `${highlighted}\n`;
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

    function buildUI() {
        const bootLoader = document.getElementById('initial-boot-loader');
        if (bootLoader) bootLoader.remove();

        const wrapper = document.createElement('div');
        wrapper.className = "flex flex-col h-screen overflow-hidden items-center w-full relative bg-gray-100 dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 transition-colors duration-200";
        
        wrapper.innerHTML = `
        <div id="model-detection-container" class="fixed inset-0 z-[999999] bg-[#131314] flex flex-col items-center justify-center p-8 text-center transition-opacity duration-300" style="display: flex; opacity: 1;">
            <div id="loading-state" class="p-10 bg-sky-500/5 dark:bg-sky-900/10 border-2 border-sky-500/30 rounded-3xl shadow-xl w-full max-w-lg" style="display: block;">
                <span class="material-symbols-outlined text-6xl text-sky-500 mb-4 animate-spin block">progress_activity</span>
                <h2 class="text-2xl font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-2">Detecting Model...</h2>
                <p class="text-gray-700 dark:text-gray-300">Verifying architectural fidelity and execution integrity...</p>
            </div>

            <div id="fast-model-blocker" class="p-8 bg-red-500/5 dark:bg-red-900/10 border-2 border-red-500/30 rounded-3xl shadow-xl w-full max-w-2xl hidden" style="display: none;">
                <span class="material-symbols-outlined text-6xl text-red-500 mb-4 animate-pulse">error</span>
                <h2 class="text-2xl font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-2">Fast Model Detected</h2>
                <p class="text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">This tool requires <strong>Gemini 3.1 Pro</strong> for advanced UI generation.</p>
                <p class="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">Activate Pro model and reply "Pro on" to resume optimization. If Pro is not available, uncheck the Canvas tool and answer exactly "text only" to activate text-only mode.</p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-6 text-left">
                    <div class="p-5 bg-red-600 dark:bg-red-500 text-white rounded-2xl shadow-lg border border-red-400">
                        <h4 class="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"><span class="material-symbols-outlined text-[20px]">toggle_on</span> Action: Unlock Pro</h4>
                        <p class="text-xs mb-2 opacity-90">1. Activate <strong>Gemini 3.1 Pro</strong>.</p>
                        <p class="text-xs opacity-90 leading-loose">2. Answer exactly: <button class="action-btn inline-flex items-center gap-1 px-2 py-0.5 bg-black/20 border border-black/20 rounded font-mono text-white text-xs hover:bg-black/40 focus:outline-none" data-action="copy-raw" data-copy-content="Pro on"><span class="copy-label pointer-events-none">Pro on</span> <span class="material-symbols-outlined text-[12px] pointer-events-none">content_copy</span></button></p>
                    </div>
                    <div class="p-5 bg-gray-800 text-white rounded-2xl shadow-lg border border-gray-600">
                        <h4 class="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"><span class="material-symbols-outlined text-[20px]">article</span> Action: Text Only</h4>
                        <p class="text-xs mb-2 opacity-90">1. Uncheck the <strong>Canvas tool</strong>.</p>
                        <p class="text-xs opacity-90 leading-loose">2. Answer exactly: <button class="action-btn inline-flex items-center gap-1 px-2 py-0.5 bg-black/20 border border-black/20 rounded font-mono text-white text-xs hover:bg-black/40 focus:outline-none" data-action="copy-raw" data-copy-content="text only"><span class="copy-label pointer-events-none">text only</span> <span class="material-symbols-outlined text-[12px] pointer-events-none">content_copy</span></button></p>
                    </div>
                </div>
                
                <button id="proceed-anyway-btn" class="mt-2 px-4 py-2 bg-red-900/50 hover:bg-red-800/80 text-white text-xs font-bold rounded-lg transition-colors border border-red-700/50">Proceed Anyway (UI May Break)</button>
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
                                <button class="action-btn flex items-center gap-1 px-3 py-1 text-xs font-bold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded transition-colors focus:outline-none whitespace-nowrap" data-action="copy-answers">
                                    <span class="material-symbols-outlined text-[14px] pointer-events-none">content_copy</span> <span class="pointer-events-none copy-answers-label">Copy Answers</span>
                                </button>
                            </div>
                            <div id="feedback-summary" class="font-mono text-[11px] text-slate-600 dark:text-slate-400 outline-none whitespace-pre-wrap p-3 bg-gray-50 dark:bg-[#18191a] rounded" contenteditable="true" spellcheck="false">Please select options above.</div>
                        </div>

                        <div class="flex flex-col md:flex-row gap-6 md:h-[750px] mt-8">
                            <div class="flex-[1.4] min-w-[320px] bg-white dark:bg-[#1e1f20] rounded-[28px] p-6 shadow-xl border border-gray-200 dark:border-gray-700/50 flex flex-col overflow-hidden">
                                <div class="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 shrink-0">
                                    <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Optimized Prompt</h3>
                                    <div id="version-controls" class="items-center gap-1 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-lg" style="display: flex;">
                                        <button id="v-prev-btn" class="action-btn flex items-center justify-center w-6 h-6 rounded transition-colors text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed">
                                            <span class="material-symbols-outlined text-[16px] pointer-events-none">chevron_left</span>
                                        </button>
                                        <span id="v-display-label" class="text-[10px] font-bold px-2 text-slate-700 dark:text-slate-300 min-w-[40px] text-center">...</span>
                                        <button id="v-next-btn" class="action-btn flex items-center justify-center w-6 h-6 rounded transition-colors text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed">
                                            <span class="material-symbols-outlined text-[16px] pointer-events-none">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                                <div id="prompt-ui-container" class="custom-scrollbar outline-none whitespace-pre-wrap text-[13px] leading-relaxed text-gray-800 dark:text-gray-200 overflow-auto flex-grow" contenteditable="true" spellcheck="false"></div>
                            </div>
                            
                            <div id="path-b-kb" class="hidden flex-1 min-w-[320px] bg-gray-50 dark:bg-[#18191a] rounded-[28px] p-6 shadow-inner border border-gray-200 dark:border-gray-700/50 flex-col overflow-hidden">
                                <div class="flex flex-col h-full">
                                    <h3 class="text-base font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-4 border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center gap-2 shrink-0">
                                        <span class="material-symbols-outlined text-[20px]">folder_zip</span> Gem Knowledge Base
                                    </h3>
                                    <div class="custom-scrollbar overflow-auto flex-grow">
                                        <p class="mb-5 text-sm italic opacity-80 text-gray-500">Download or copy these templates to upload to your Gem.</p>
                                        <div id="ui-kb-templates-container"></div>
                                    </div>
                                </div>
                            </div>

                            <div id="path-a-preview" class="hidden flex-1 min-w-[320px] bg-gray-50 dark:bg-[#18191a] rounded-[28px] p-6 shadow-inner border border-gray-200 dark:border-gray-700/50 flex-col overflow-hidden">
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
                                    <h4 class="font-bold text-slate-400 text-xs uppercase tracking-widest mt-8 mb-2 border-b border-gray-100 dark:border-gray-800 pb-2">Standard Prompt Execution</h4>
                                    <div class="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl mb-4 shadow-sm">
                                        <span class="font-bold text-emerald-500 block mb-1 underline text-xs">Step 1: Copy Prompt</span>
                                        Copy the optimized prompt from the editor panel.
                                    </div>
                                    <div class="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl mt-4 shadow-sm">
                                        <span class="font-bold text-emerald-500 block mb-1 underline text-xs">Step 2: Execute</span>
                                        Paste it into a fresh chat with Gemini and execute it to see the magic.
                                    </div>
                                </div>

                                <div id="setup-option-b" class="hidden">
                                    <h4 class="font-bold text-slate-400 text-xs uppercase tracking-widest mt-8 mb-2 border-b border-gray-100 dark:border-gray-800 pb-2">Custom Gem Setup</h4>
                                    <div class="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl mb-4 shadow-sm">
                                        <span class="font-bold text-sky-500 block mb-1 underline text-xs">Step 1: Gem Creation</span>
                                        Navigate to the <strong>Gem manager menu</strong> by clicking on the <strong>Gems</strong> bar in the sidebar and click on <span class="inline-block bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full text-[11px] font-bold border border-sky-200 dark:border-sky-700/50 shadow-sm">+ New Gem</span>.
                                    </div>
                                    <div class="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 shadow-sm">
                                        <div>
                                            <span class="font-bold text-sky-500 block mb-1 underline text-xs">Step 2: Name the Gem</span>
                                            <span id="setup-gem-name" class="font-mono text-sm">...</span>
                                        </div>
                                        <button class="action-btn flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-800/50 rounded-lg transition-colors focus:outline-none" data-action="copy-text" data-text-target="setup-gem-name">
                                            <span class="material-symbols-outlined text-[14px] pointer-events-none">content_copy</span> <span class="copy-label pointer-events-none">Copy Name</span>
                                        </button>
                                    </div>
                                    <div class="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 shadow-sm">
                                        <div>
                                            <span class="font-bold text-sky-500 block mb-1 underline text-xs">Step 3: Describe the Gem</span>
                                            <span id="setup-gem-desc" class="text-sm italic">...</span>
                                        </div>
                                        <button class="action-btn flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-800/50 rounded-lg transition-colors focus:outline-none" data-action="copy-text" data-text-target="setup-gem-desc">
                                            <span class="material-symbols-outlined text-[14px] pointer-events-none">content_copy</span> <span class="copy-label pointer-events-none">Copy Desc</span>
                                        </button>
                                    </div>
                                    <div class="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 shadow-sm">
                                        <div>
                                            <span class="font-bold text-sky-500 block mb-1 underline text-xs">Step 4: Gem Instructions</span>
                                            Copy prompt and paste it into the <strong>Gem Instructions</strong> field.
                                        </div>
                                        <button class="action-btn flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-800/50 rounded-lg transition-colors focus:outline-none" data-action="copy-prompt">
                                            <span class="material-symbols-outlined text-[14px] pointer-events-none">content_copy</span> <span class="copy-label pointer-events-none">Copy Prompt</span>
                                        </button>
                                    </div>
                                    <div class="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl mt-4 shadow-sm">
                                        <span class="font-bold text-sky-500 block mb-1 underline text-xs">Step 5: Tool Selection</span>
                                        In the Gem setup page, select <strong id="setup-tool-name">Canvas UI</strong> from the tools dropdown.
                                    </div>
                                    <div class="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl mt-4 shadow-sm" id="setup-step-6">
                                        <span class="font-bold text-sky-500 block mb-1 underline text-xs">Step 6: Knowledge Database</span>
                                        <span class="text-sm">Download the required HTML templates from the Knowledge Base tab and upload them to your Gem.</span>
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

    function initApp() {
        console.log("[GPA Engine] initApp() executing v11.16 logic.");

        // 1. Parse the injected JSON state
        const stateElement = document.getElementById('app-state');
        let appState = {};
        if (stateElement) {
            try { 
                appState = JSON.parse(stateElement.textContent.replace(/\u00A0/g, ' ')); 
            } catch (err) { 
                console.error("Failed to parse #app-state JSON. Proceeding with empty state to prevent hard crash.");
            }
        }

        // DEFENSIVE SCHEMA PATCH: Guarantee meta object exists
        appState.meta = appState.meta || {};

        const GPA_STATIC_DICTIONARY = {
            PERSONA_DEFS: `
      - **Technical Mode (Default):** Use for coding, data analysis, business logic, or structured workflows. Persona: "The Prompt Engineer," the elite Prompt Optimizer. Language: Precise, mission-oriented. **Associated Model:** Gemini 3.1 Pro.
      - **Creative Mode:** Use for creative writing, storytelling, art generation, or marketing copy. Persona: "The Creator," an inspiring guide. Language: Evocative, story-focused. **UI Override:** Rename HTML headers: "Executive Summary" to "Current Vision", "Updates & Upgrades" to "Creative Upgrades", and "Surgical Questions" to "Refining the Vision". **Associated Model:** Gemini 3 Deep Think.
      - **Educational Mode:** Use if the user asks for explanations, wants to learn prompt engineering, or asks "why/how". Persona: "The Tutor," a Socratic instructor. Language: Inquisitive. **Unique Feature:** Every suggestion must be followed by a **Reasoning:** block explaining the prompt engineering principle behind it. **Associated Model:** Gemini 3 Deep Think.`,
              
            ROUTING_DETAILS: `
  **INITIALIZATION & ROUTING:**
  [CASE A] IF user message == "GPA update": 
      -> Process request and update internal GPA instructions/core logic using provided html template.
  [CASE B] IF user message is < 5 words AND != "GPA update" (Normal Greeting):
      -> OUTPUT BASE: "**Hi! I am the Gemini Prompt Architect, your proactive AI coach.**\\n\\nMy purpose is to help clarify your intent and architect it into a highly optimized Meta-Prompt to achieve your goals.\\n\\n**Here is our game plan:**\\n> 1. Tell me what you are trying to achieve or build.\\n> 2. I will ask a few quick questions to understand your exact context."
      -> TERMINATE.
  [CASE C] OTHERWISE (Standard Request):
      -> Proceed to evaluate Path 1 or Path 2 below.

  **PATH 1 (Canvas Mode - Default for 5+ word drafts):** Execute Phases 1-3. Output the **Standard Chat Response** AND the HTML Canvas Block. Apply Mode-specific UI Overrides if in Creative Mode.
  **PATH 2 (Text-Only Mode):** If requested, bypass JSON Canvas. Output the **Standard Chat Response** in the chat, and MUST generate the optimized prompt in a separate Markdown Canvas file (e.g., \`Optimized_Prompt.md\`) using the file generation workflow.
   
  **Standard Chat Response Format:**
  **Introduction:** State role, active mode, and persona.
  **Feedback Analysis:** Analyze the draft/feedback.
  **Strategic Rationale:** Explain architectural improvements and explicitly cite which sections/sources of the Unified_Airbus_Prompt_Mandates.pdf were applied.
  **Text-Only Path UI Injection:** If Path 2 is executed, explicitly include the Executive Summary, Updates & Upgrades, and Surgical Questions sections in the chat answer.
  **Canvas UI Introduction:** (If Path 1).
  **Next Steps:** Conversational list of follow-up actions.
  **Parser Protection (CRITICAL):** You MUST NEVER use artifact trigger code (e.g., triple backticks followed by a language or filepath) in your conversational chat answers unless you are explicitly intending to generate a distinct artifact/file block.
  **PRO REMINDER:** At the absolute end of EVERY message, append a reminder based on the path:
  - PATH 1 (Canvas Mode): "*(Note: Gemini Pro is highly recommended for optimal prompt optimization and UI rendering)*"
  - PATH 2 (Text-Only Mode, Turn 1 ONLY): "*(Note: Gemini Pro is recommended for optimal prompt optimization)*"`,
              
            ARTIFACT_TEMPLATE: `
\`\`\`html:GPA Output:GPA_Unified_vX.X.html
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GPA Optimizer</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
</head>
<body class="bg-gray-100 dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 transition-colors duration-200 flex flex-col h-screen overflow-hidden items-center w-full relative">
    <div id="initial-boot-loader" class="fixed inset-0 z-50 flex items-center justify-center bg-[#131314] text-sky-500 font-mono text-sm animate-pulse">
        [INITIALIZING GPA ARCHITECTURE...]
    </div>
    <script type="application/json" id="app-state"><\/script>
    <script type="text/plain" id="raw-draft-payload"><\/script>
    <script type="text/plain" id="previous-prompt-payload"><\/script>
    <script type="text/plain" id="raw-prompt-payload"><\/script>
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
\`\`\`eof`
        };

        buildUI();

        // BULLETPROOF EXTRACTION
        const reflexOut = appState.meta?.reflexOutput?.toString().trim().toUpperCase() || 
                          appState.reflexOutput?.toString().trim().toUpperCase() || 
                          "";

        if (reflexOut !== "HI") {
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

        // --- V11.16 MACRO DECODER & HYDRATION ---
        function decodeMacro(text) {
            if (!text) return "";
            return text.replace(/\[\[CLOSING_SCRIPT\]\]/gi, '</' + 'script>')
                       .replace(/\[\[BACKTICK\]\]/g, '`')
                       .replace(/\[\[LESS_THAN\]\]/g, '<')
                       .replace(/\[\[GREATER_THAN\]\]/g, '>')
                       .replace(/\[\[MACRO_PERSONA_DEFS\]\]/g, GPA_STATIC_DICTIONARY.PERSONA_DEFS)
                       .replace(/\[\[MACRO_ROUTING_DETAILS\]\]/g, GPA_STATIC_DICTIONARY.ROUTING_DETAILS)
                       .replace(/\[\[MACRO_ARTIFACT_TEMPLATE\]\]/g, GPA_STATIC_DICTIONARY.ARTIFACT_TEMPLATE);
        }

        const payloads = [];
        const draftNode = document.getElementById('raw-draft-payload');
        const prevNode = document.getElementById('previous-prompt-payload');
        const promptNode = document.getElementById('raw-prompt-payload');

        if (draftNode && draftNode.textContent.trim()) payloads.push(draftNode.textContent.trim());
        if (prevNode && prevNode.textContent.trim()) payloads.push(prevNode.textContent.trim());
        if (promptNode && promptNode.textContent.trim()) payloads.push(promptNode.textContent.trim());

        let parsedVersions = appState.versions?.length ? appState.versions : [];
        
        // Dynamically recreate versions using float math based on current payload sequence
        if (parsedVersions.length === 0 && payloads.length > 0) {
            let currentVerStr = appState.meta?.version || "1.0";
            let match = currentVerStr.match(/v?(\d+\.\d+)/);
            let currentVerNum = match ? parseFloat(match[1]) : 1.0;
            
            for (let i = 0; i < payloads.length; i++) {
                let offset = payloads.length - 1 - i; 
                let vId = `v${(currentVerNum - (offset * 0.01)).toFixed(2)}`;
                parsedVersions.push({ id: vId, content: payloads[i] });
            }
            // Guarantee string match for the newest version
            if (parsedVersions.length > 0) {
                parsedVersions[parsedVersions.length - 1].id = `v${currentVerStr.replace('v','')}`;
            }
        }
        if (parsedVersions.length === 0) parsedVersions = [{ id: "v1.0", content: "" }];

        // DECODE MACROS FOR ALL VERSIONS
        for (let i = 0; i < parsedVersions.length; i++) {
            if (parsedVersions[i].content) {
                parsedVersions[i].content = decodeMacro(parsedVersions[i].content);
            }
        }

        window.versions = parsedVersions.filter(v => v.content);
        if (window.versions.length === 0) window.versions = [{ id: "Current", content: "" }];

        // 2. Bind the JSON data to UI containers
        document.title = `${appState.meta.gemName || 'GPA'} ${appState.meta.version || (appState.iterations ? 'v' + appState.iterations : '')}`;
        document.getElementById('ui-gem-name').textContent = appState.meta.gemName || "Gemini Prompt Architect";
        
        if (appState.executiveSummary) {
            const summaryEl = document.getElementById('summary-ui-container');
            if (summaryEl) summaryEl.textContent = appState.executiveSummary;
            
            const logicEl = document.getElementById('logic-li');
            const uiLogic = document.getElementById('ui-logic');
            if (appState.meta?.promptLogic || appState.meta?.globalPromptLogic) {
                if (logicEl) logicEl.style.display = 'list-item';
                if (uiLogic) uiLogic.textContent = appState.meta.promptLogic || appState.meta.globalPromptLogic;
            } else {
                if (logicEl) logicEl.style.display = 'none';
            }

            const outputEl = document.getElementById('output-li');
            const uiOutput = document.getElementById('ui-output');
            if (appState.meta?.targetOutput) {
                if (outputEl) outputEl.style.display = 'list-item';
                if (uiOutput) uiOutput.textContent = appState.meta.targetOutput;
            } else {
                if (outputEl) outputEl.style.display = 'none';
            }
        } else {
            const summaryEl = document.getElementById('summary-ui-container');
            if (summaryEl) summaryEl.textContent = appState.meta.coreObjective || "N/A";
            const uiLogic = document.getElementById('ui-logic');
            if (uiLogic) uiLogic.textContent = appState.meta.globalPromptLogic || appState.meta.promptLogic || "N/A";
            const uiOutput = document.getElementById('ui-output');
            if (uiOutput) uiOutput.textContent = appState.meta.targetOutput || "N/A";
        }

        document.getElementById('ui-model').textContent = appState.meta.recommendedModel || "Gemini 3.1 Pro";
        document.getElementById('ui-tool').textContent = appState.meta.requiredTool || "Canvas UI";
        
        // Setup Tab Bindings
        document.getElementById('setup-gem-name').textContent = appState.meta.gemName || "Optimized Gem";
        document.getElementById('setup-gem-desc').textContent = appState.meta.coreObjective || appState.meta.promptLogic || appState.executiveSummary || "Optimized instructions";
        document.getElementById('setup-tool-name').textContent = appState.meta.requiredTool || "Canvas UI";

        const updateTitle = document.getElementById('ui-update-title');
        if (updateTitle) updateTitle.textContent = `Refinements Applied (Iteration ${appState.iterations || 1}):`;

        const updatesList = document.getElementById('ui-updates-list');
        if (appState.updates && Array.isArray(appState.updates) && updatesList) {
            appState.updates.forEach(u => {
                const li = document.createElement('li'); li.innerHTML = u; updatesList.appendChild(li);
            });
        }

        const execPath = appState.meta.executionPath || "B";
        document.getElementById('setup-option-a').style.display = execPath === 'A' ? 'block' : 'none';
        document.getElementById('setup-option-b').style.display = execPath === 'B' ? 'block' : 'none';
        document.getElementById('path-a-preview').style.display = execPath === 'A' ? 'flex' : 'none';
        document.getElementById('path-b-kb').style.display = execPath === 'B' ? 'flex' : 'none';

        // KB Templates Handling
        const kbContainer = document.getElementById('ui-kb-templates-container');
        const kbKeys = appState.kbTemplates ? Object.keys(appState.kbTemplates) : [];
        document.getElementById('ui-kb-status').textContent = kbKeys.length > 0 ? `Active (${kbKeys.length} File${kbKeys.length > 1 ? 's' : ''})` : `Inactive (0 Files)`;

        if (kbContainer && kbKeys.length > 0) {
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
                        <button class="action-btn px-3 py-1.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 hover:bg-teal-200 rounded-lg text-[11px] font-bold flex items-center gap-1 focus:outline-none" data-action="copy-kb" data-kb-key="${filename}">
                            <span class="material-symbols-outlined text-[14px]">content_copy</span> <span class="copy-label">Copy HTML</span>
                        </button>
                        <button class="action-btn px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1 focus:outline-none" data-action="download-kb" data-kb-key="${filename}">
                            <span class="material-symbols-outlined text-[14px]">download</span> Download
                        </button>
                        <button class="action-btn px-3 py-1.5 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 hover:bg-sky-200 rounded-lg text-[11px] font-bold flex items-center gap-1 focus:outline-none" data-action="open-kb" data-kb-key="${filename}">
                            <span class="material-symbols-outlined text-[14px]">open_in_new</span> Open
                        </button>
                    </div>
                `;
                kbContainer.appendChild(kbDiv);
            });
        } else if (kbContainer) {
             kbContainer.innerHTML = '<p class="text-sm text-gray-500">No KB templates generated for this iteration.</p>';
        }

        const setupStep6 = document.getElementById('setup-step-6');
        if (setupStep6 && kbKeys.length === 0) {
            setupStep6.innerHTML = '<span class="font-bold text-sky-500 block mb-1 underline text-xs">Step 6: Knowledge Database</span><span class="text-sm">No KB templates generated for this iteration.</span>';
        }

        // --- QUESTIONS MAPPING (WITH STRING COMPILER) ---
        const qContainer = document.getElementById('ui-questions-container');
        if (qContainer && Array.isArray(appState.questions)) {
            
            // 1. COMPILER: Convert flat strings to the expected object structure
            const compiledQuestions = appState.questions.map((q, idx) => {
                if (typeof q === 'string') {
                    return {
                        id: `q${idx + 1}`,
                        title: `Refinement ${idx + 1}`,
                        question: q,
                        context: "Select an option to refine the prompt generation.",
                        options: [
                            { value: "Yes", label: "Yes, apply this.", desc: "Implement the suggested refinement.", pro: "Greater specificity.", con: "May narrow scope." },
                            { value: "No", label: "No, skip this.", desc: "Maintain current trajectory.", pro: "Faster execution.", con: "Missed optimization." }
                        ]
                    };
                }
                return q; // If it's already an object, leave it alone
            });

            // 2. RENDER: Use the compiled objects
            compiledQuestions.forEach((q, idx) => {
                let optionsHtml = '';
                if (Array.isArray(q.options)) {
                    q.options.forEach((opt, oIdx) => {
                        const optId = `${q.id}-opt${oIdx}`;
                        optionsHtml += `
                            <tr class="bg-white dark:bg-slate-900 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800">
                                <td class="border border-gray-300 dark:border-gray-700 p-3 align-top">
                                    <div class="flex items-start gap-3">
                                        <input type="radio" id="${optId}" name="${q.id}" value="${opt.value}" class="mt-1 cursor-pointer accent-sky-500 shrink-0">
                                        <div>
                                            <label for="${optId}" class="cursor-pointer font-bold text-sky-600 dark:text-sky-400 text-[13px] md:text-sm block mb-1">${opt.label}</label>
                                            <p class="text-xs text-slate-500 dark:text-slate-400">${opt.desc}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="border border-gray-300 dark:border-gray-700 p-3 text-xs leading-relaxed align-top">
                                    <ul class="list-disc pl-4 space-y-1">
                                        <li><span class="text-emerald-500 font-bold">Pro:</span> ${opt.pro}</li>
                                        <li><span class="text-rose-500 font-bold">Con:</span> ${opt.con}</li>
                                    </ul>
                                </td>
                            </tr>
                        `;
                    });
                }

                optionsHtml += `
                    <tr class="bg-white dark:bg-slate-900 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800">
                        <td class="border border-gray-300 dark:border-gray-700 p-3 align-top">
                            <div class="flex items-start gap-3">
                                <input type="radio" id="${q.id}-other" name="${q.id}" value="Other" class="mt-1 cursor-pointer accent-sky-500 shrink-0">
                                <div class="flex-grow">
                                    <label for="${q.id}-other" class="cursor-pointer font-bold text-sky-600 dark:text-sky-400 text-[13px] md:text-sm block mb-1">Other:</label>
                                    <input type="text" class="other-input w-full border-b border-gray-300 dark:border-gray-600 bg-transparent outline-none focus:border-sky-500 text-xs pb-1" placeholder="Type custom option...">
                                </div>
                            </div>
                        </td>
                        <td class="border border-gray-300 dark:border-gray-700 p-3 text-xs leading-relaxed text-slate-500 align-top">
                            Provide your own specific constraint.
                        </td>
                    </tr>
                `;

                qContainer.insertAdjacentHTML('beforeend', `
                    <div class="bg-white dark:bg-[#1e1f20] p-5 rounded-xl border border-gray-200 dark:border-gray-700 question-table mb-6">
                        <div class="mb-3 px-1">
                            <h4 class="font-bold text-slate-800 dark:text-slate-200">${idx + 1}. <span class="q-title-text">${q.question || q.title || q}</span></h4>
                            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">${q.context || ''}</p>
                        </div>
                        <table class="w-full text-sm border-collapse border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                            <thead>
                                <tr class="bg-gray-100 dark:bg-gray-800 text-left">
                                    <th class="border border-gray-300 dark:border-gray-700 p-3 w-[45%]">Options</th>
                                    <th class="border border-gray-300 dark:border-gray-700 p-3 w-[55%]">Pros & Cons</th>
                                </tr>
                            </thead>
                            <tbody>${optionsHtml}</tbody>
                        </table>
                    </div>
                `);
            });
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

        document.addEventListener('change', e => { if(e.target.matches('input[type="radio"], .other-input')) updateFeedback(); });
        document.addEventListener('keyup', e => { if(e.target.matches('input[type="radio"], .other-input')) updateFeedback(); });

        // 3. Extract the actual prompt payload and render it
        const promptContainer = document.getElementById('prompt-ui-container');
        if (promptContainer && window.versions.length > 0) {
            // Note: Macro tokens are decoded during the mapped history array phase above.
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
            const currentData = window.versions[window.currentVersionIndex]?.content || '';
            const previousData = window.currentVersionIndex > 0 ? window.versions[window.currentVersionIndex - 1]?.content : null;
            renderDiff(promptEl, currentData, previousData);
        };
        window.updateVersionUI();

        document.addEventListener('click', function(e) {
            if (e.target.closest('#v-prev-btn')) {
                if (window.currentVersionIndex > 0) { window.currentVersionIndex--; window.updateVersionUI(); }
                return;
            }
            if (e.target.closest('#v-next-btn')) {
                if (window.currentVersionIndex < window.versions.length - 1) { window.currentVersionIndex++; window.updateVersionUI(); }
                return;
            }
            
            const actionBtn = e.target.closest('.action-btn');
            const tabBtn = e.target.closest('.tab-btn');
            
            if (tabBtn) {
                const tab = tabBtn.getAttribute('data-tab');
                ['prompt', 'flow', 'setup'].forEach(t => {
                    const contentEl = document.getElementById('app-content-' + t);
                    const tEl = document.querySelector(`.tab-btn[data-tab="${t}"]`);
                    if(contentEl && tEl) {
                        contentEl.classList.add('hidden');
                        tEl.className = "tab-btn pb-1 px-1 text-sm font-semibold text-gray-500 hover:text-gray-300 transition-colors whitespace-nowrap";
                    }
                });
                const activeContent = document.getElementById('app-content-' + tab);
                if(activeContent) activeContent.classList.remove('hidden');
                tabBtn.className = "tab-btn tab-active pb-1 px-1 text-sm font-semibold transition-colors whitespace-nowrap";
                return;
            }
            
            if (!actionBtn) return;
            const action = actionBtn.getAttribute('data-action');
            
            if (action === 'theme-toggle') document.documentElement.classList.toggle('dark');
            
            if (action === 'copy-raw') triggerCopy(actionBtn.getAttribute('data-copy-content'), actionBtn.querySelector('.copy-label'));
            
            if (action === 'copy-prompt' || action === 'download-prompt') {
                const content = window.versions[window.currentVersionIndex].content;
                if (action === 'copy-prompt') triggerCopy(content, actionBtn.querySelector('.copy-label'));
                if (action === 'download-prompt') {
                    const blob = new Blob([content], { type: 'text/markdown' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `Optimized_Prompt_${window.versions[window.currentVersionIndex].id}.md`;
                    a.click();
                }
            }
            
            if (action === 'copy-answers') triggerCopy(document.getElementById('feedback-summary').textContent, actionBtn.querySelector('.copy-answers-label'));
            if (action === 'copy-text') triggerCopy(document.getElementById(actionBtn.getAttribute('data-text-target')).textContent, actionBtn.querySelector('.copy-label'));
            
            if (action === 'copy-kb' || action === 'download-kb' || action === 'open-kb') {
                const key = actionBtn.getAttribute('data-kb-key');
                let htmlContent = appState.kbTemplates ? appState.kbTemplates[key] : null;
                if (!htmlContent) return;

                if(action === 'copy-kb') {
                    triggerCopy(htmlContent, actionBtn.querySelector('.copy-label'));
                } else if (action === 'download-kb') {
                    const blob = new Blob([htmlContent], { type: 'text/html' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob); a.download = key; a.click();
                } else if (action === 'open-kb') {
                    const newWindow = window.open();
                    if (newWindow) { newWindow.document.open(); newWindow.document.write(htmlContent); newWindow.document.close(); }
                }
            }
        });

        // Hide boot overlay and show app
        const mdc = document.getElementById('model-detection-container');
        if (mdc) { 
            mdc.style.opacity = '0'; 
            setTimeout(() => mdc.style.display = 'none', 300); 
        }
        const mainApp = document.getElementById('main-app-container');
        if(mainApp) { 
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
