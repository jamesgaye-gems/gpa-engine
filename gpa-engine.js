/**
 * Gemini Prompt Architect (GPA) - Core Rendering Engine
 * Version: 7.10 (Restored & Hardened)
 * Organization: Airbus
 */
(function() {
    // --- GLOBAL CRASH INTERCEPTOR (Prevents Black Screens) ---
    window.onerror = function(msg, url, line, col, err) {
        document.body.innerHTML += `<div style="position:fixed;top:0;left:0;width:100%;background:#7f1d1d;color:white;padding:20px;z-index:9999999;font-family:monospace;font-size:14px;box-shadow:0 10px 15px rgba(0,0,0,0.5);">
            <strong style="font-size:18px;">GPA ENGINE FATAL CRASH:</strong><br><br>
            <strong>Error:</strong> ${msg}<br>
            <strong>Line:</strong> ${line}<br><br>
            The engine encountered a critical syntax error and halted. Check the browser console.</div>`;
        return false;
    };

    // --- 1. UI SKELETON INJECTION ---
    function buildUI() {
        const wrapper = document.createElement('div');
        wrapper.className = "flex flex-col h-screen overflow-hidden items-center w-full relative bg-gray-100 dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 transition-colors duration-200";
        
        wrapper.innerHTML = `
        <div id="sys-boot-overlay" class="fixed inset-0 z-[999999] bg-[#131314] flex flex-col items-center justify-center p-8 text-center transition-opacity duration-300">
            <div id="sys-loader" class="p-10 bg-sky-500/5 border-2 border-sky-500/30 rounded-3xl shadow-xl w-full max-w-lg">
                <span class="material-symbols-outlined text-6xl text-sky-500 mb-4 animate-spin block">progress_activity</span>
                <h2 class="text-2xl font-black text-sky-600 uppercase tracking-widest mb-2">Initializing Architecture...</h2>
                <p class="text-gray-400">Hydrating Decoupled Payload Shell...</p>
            </div>
            <div id="fast-model-blocker" class="p-8 bg-red-500/5 dark:bg-red-900/10 border-2 border-red-500/30 rounded-3xl shadow-xl w-full max-w-2xl hidden" style="display: none;">
                <span class="material-symbols-outlined text-6xl text-red-500 mb-4 animate-pulse">error</span>
                <h2 class="text-2xl font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-2">Gemini Fast Model Detected</h2>
                <p class="text-gray-700 dark:text-gray-300 mb-2 text-lg leading-relaxed">This tool requires the <strong>Gemini 3.1 Pro</strong> model's advanced architectural fidelity to generate the complete UI.</p>
            </div>
        </div>

        <div id="main-app-container" class="max-w-[1250px] w-full flex-col h-full bg-[#f0f4f9] dark:bg-[#131314] shadow-2xl border-x border-gray-300 dark:border-gray-800 hidden">
            <div class="shrink-0 z-50 border-b border-gray-200 dark:border-gray-800 px-4 py-4 md:px-8 shadow-sm">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="flex items-center gap-4">
                        <div class="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                            <span class="material-symbols-outlined text-sky-500 text-[28px]">design_services</span>
                            <span id="ui-gem-name" class="font-black text-xl hidden sm:block">Gemini Prompt Architect</span>
                        </div>
                        <div class="w-px h-8 bg-gray-300 dark:bg-gray-700 hidden sm:block"></div>
                        <div class="flex items-center space-x-6 w-full md:w-auto overflow-x-auto no-scrollbar">
                            <button class="tab-btn tab-active pb-1 px-1 text-base font-semibold text-sky-500 border-b-2 border-sky-500 whitespace-nowrap" data-tab="prompt">System Prompt & Feedback</button>
                            <button class="tab-btn pb-1 px-1 text-base font-semibold text-gray-500 whitespace-nowrap" data-tab="setup">Setup Instructions</button>
                        </div>
                    </div>
                    <div class="flex items-center justify-end space-x-3 shrink-0">
                        <button class="action-btn flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-full transition-all shadow-lg focus:outline-none whitespace-nowrap" data-action="copy-prompt">
                            <span class="material-symbols-outlined text-[18px] pointer-events-none">content_copy</span> <span class="copy-label pointer-events-none">Copy Prompt</span>
                        </button>
                        <button class="action-btn w-10 h-10 flex items-center justify-center bg-transparent hover:bg-gray-200 dark:hover:bg-[#282a2c] rounded-full transition-colors focus:outline-none" data-action="theme-toggle">
                            <span class="material-symbols-outlined text-[22px] pointer-events-none">light_mode</span>
                        </button>
                    </div>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto">
                <div class="p-4 md:p-8 pt-4">
                    <div id="app-content-prompt" class="space-y-6 mt-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div class="bg-blue-50/50 dark:bg-sky-900/10 border-2 border-sky-100 dark:border-sky-900/30 rounded-[28px] p-6 md:p-8 shadow-sm flex flex-col">
                                <h3 class="text-xl font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-4 flex items-center gap-3"><span class="material-symbols-outlined text-[24px]">analytics</span> Executive Summary</h3>
                                <div class="text-sm md:text-base text-gray-700 dark:text-gray-300 flex-grow"><ul class="list-none space-y-4 mb-6">
                                    <li><strong class="text-sky-600 dark:text-sky-400 block mb-1">Core Objective:</strong> <span id="ui-obj" class="block leading-relaxed">...</span></li>
                                    <li><strong class="text-sky-600 dark:text-sky-400 block mb-1">Prompt Logic:</strong> <span id="ui-logic" class="block leading-relaxed">...</span></li>
                                </ul></div>
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-sky-200 dark:border-sky-800 mt-auto">
                                    <div><span class="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Recommended Model</span><span class="font-semibold text-sm text-sky-700 dark:text-sky-300" id="ui-model">...</span></div>
                                    <div><span class="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Required Tool</span><span class="font-semibold text-sm text-sky-700 dark:text-sky-300" id="ui-tool">...</span></div>
                                    <div><span class="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Execution Path</span><span class="font-semibold text-sm text-sky-700 dark:text-sky-300" id="ui-path">...</span></div>
                                </div>
                            </div>
                            <div class="bg-indigo-50/50 dark:bg-indigo-900/10 border-2 border-indigo-100 dark:border-indigo-900/30 rounded-[28px] p-6 md:p-8 shadow-sm flex flex-col">
                                <h3 class="text-xl font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-3"><span class="material-symbols-outlined text-[24px]">update</span> Updates & Upgrades</h3>
                                <div class="text-sm md:text-base text-gray-700 dark:text-gray-300 flex-grow">
                                    <p class="mb-4 font-bold text-indigo-500 text-base" id="ui-update-title"></p>
                                    <ul class="list-disc pl-5 space-y-3 leading-relaxed" id="ui-updates-list"></ul>
                                </div>
                            </div>
                        </div>

                        <hr class="border-sky-200 dark:border-sky-800/50 my-8">
                        <h3 class="text-xl font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-4 flex items-center gap-3"><span class="material-symbols-outlined text-[24px]">tune</span> Surgical Questions</h3>
                        <div id="ui-questions-container" class="space-y-6"></div>

                        <div class="mt-8 bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                            <div class="flex items-center justify-start gap-4 mb-4">
                                <h4 class="font-bold text-slate-800 dark:text-slate-200 text-base flex items-center gap-2"><span class="material-symbols-outlined text-sky-500 text-[20px]">chat</span> Feedback Summary</h4>
                                <button class="action-btn flex items-center gap-1 px-4 py-1.5 text-sm font-bold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded transition-colors focus:outline-none whitespace-nowrap" data-action="copy-answers"><span class="material-symbols-outlined text-[16px] pointer-events-none">content_copy</span> <span class="pointer-events-none copy-answers-label">Copy Answers</span></button>
                            </div>
                            <div id="feedback-summary" class="font-mono text-sm text-slate-600 dark:text-slate-400 outline-none whitespace-pre-wrap p-4 bg-gray-50 dark:bg-[#18191a] rounded leading-relaxed" contenteditable="true" spellcheck="false">Please select options above.</div>
                        </div>

                        <div class="flex flex-col md:flex-row gap-6 md:h-[750px] mt-8">
                            <div class="flex-[1.4] min-w-[320px] bg-white dark:bg-[#1e1f20] rounded-[28px] p-6 shadow-xl border border-gray-200 dark:border-gray-700/50 flex flex-col overflow-hidden">
                                <div class="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700 pb-3 shrink-0">
                                    <h3 class="text-base font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Optimized Prompt</h3>
                                    <div id="version-controls" class="items-center gap-1 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-lg flex">
                                        <button id="v-prev-btn" class="action-btn flex items-center justify-center w-7 h-7 rounded transition-colors text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"><span class="material-symbols-outlined text-[18px] pointer-events-none">chevron_left</span></button>
                                        <span id="v-display-label" class="text-xs font-bold px-3 text-slate-700 dark:text-slate-300 min-w-[50px] text-center">...</span>
                                        <button id="v-next-btn" class="action-btn flex items-center justify-center w-7 h-7 rounded transition-colors text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"><span class="material-symbols-outlined text-[18px] pointer-events-none">chevron_right</span></button>
                                    </div>
                                </div>
                                <div id="gem-instructions" class="outline-none whitespace-pre-wrap text-sm font-mono leading-relaxed text-gray-800 dark:text-gray-200 overflow-auto flex-grow" contenteditable="true" spellcheck="false"></div>
                            </div>
                            
                            <div id="path-b-kb" class="hidden flex-1 min-w-[320px] bg-gray-50 dark:bg-[#18191a] rounded-[28px] p-6 shadow-inner border border-gray-200 dark:border-gray-700/50 flex-col overflow-hidden">
                                <div class="flex flex-col h-full"><h3 class="text-base font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-4 border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center gap-2 shrink-0"><span class="material-symbols-outlined text-[20px]">folder_zip</span> Gem Knowledge Base</h3><div class="overflow-auto flex-grow"><p class="mb-5 text-sm italic opacity-80 text-gray-500">Download or copy templates required for this Gem.</p><div id="ui-kb-templates-container"></div></div></div>
                            </div>
                            
                            <div id="path-a-preview" class="hidden flex-1 min-w-[320px] bg-gray-50 dark:bg-[#18191a] rounded-[28px] p-6 shadow-inner border border-gray-200 dark:border-gray-700/50 flex-col overflow-hidden">
                                <h3 class="text-base font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4 border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center gap-2"><span class="material-symbols-outlined text-[20px]">visibility</span> Standard Execution</h3><div class="text-sm text-gray-700 dark:text-gray-400 flex-grow leading-relaxed">This is a standard prompt intended for immediate execution in the chat window, not a Custom Gem. Copy the prompt from the left panel and paste it into a new chat.</div>
                            </div>
                        </div>
                    </div>

                    <div id="app-content-setup" class="hidden pb-12">
                        <div class="max-w-3xl mx-auto bg-white dark:bg-[#1e1f20] rounded-[28px] p-8 md:p-10 border border-gray-200 dark:border-gray-700 shadow-xl mt-8">
                            <h3 class="text-2xl font-bold mb-8 flex items-center gap-3 text-sky-500"><span class="material-symbols-outlined text-[28px]">rocket_launch</span> Deployment Guide</h3>
                            <div class="space-y-6 text-base text-gray-700 dark:text-gray-300">
                                <div id="setup-option-a" class="hidden">
                                    <h4 class="font-bold text-slate-400 text-sm uppercase tracking-widest mt-4 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Standard Prompt Execution</h4>
                                    <div class="p-5 bg-gray-50 dark:bg-slate-800 rounded-xl mb-4 shadow-sm"><span class="font-bold text-emerald-500 block mb-2 underline text-xs">Step 1: Copy Prompt</span>Return to the <strong>System Prompt</strong> tab and copy the optimized prompt.</div>
                                </div>
                                <div id="setup-option-b" class="hidden">
                                    <h4 class="font-bold text-slate-400 text-sm uppercase tracking-widest mt-4 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Custom Gem Setup</h4>
                                    <div class="p-5 bg-gray-50 dark:bg-slate-800 rounded-xl mb-4 shadow-sm"><span class="font-bold text-sky-500 block mb-2 underline text-xs">Step 1: Gem Creation</span>Click on <span class="inline-block bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 px-3 py-1 rounded-full text-xs font-bold">+ New Gem</span> in the sidebar.</div>
                                    <div class="p-5 bg-gray-50 dark:bg-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 shadow-sm"><div><span class="font-bold text-sky-500 block mb-2 underline text-xs">Step 2: Name the Gem</span><span id="setup-gem-name" class="font-mono text-lg font-semibold text-slate-800 dark:text-white"></span></div><button class="action-btn flex items-center gap-1 px-4 py-2 text-sm font-bold bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-800/50 rounded-lg transition-colors focus:outline-none" data-action="copy-text" data-text-target="setup-gem-name"><span class="material-symbols-outlined text-[18px] pointer-events-none">content_copy</span> <span class="copy-label pointer-events-none">Copy Name</span></button></div>
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

    // --- 2. LOGIC FUNCTIONS ---
    function decodeEntities(str) {
        if (!str) return '';
        return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    }

    function getHighlightedString(line) {
        let safeLine = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return safeLine.replace(/(&lt;\/?)([a-zA-Z0-9_:-]+)(.*?)(&gt;)/g, '<span class="text-slate-400 dark:text-slate-500">$1</span><span class="text-fuchsia-600 dark:text-fuchsia-400 font-semibold">$2</span><span class="text-fuchsia-400 dark:text-fuchsia-300">$3</span><span class="text-slate-400 dark:text-slate-500">$4</span>');
    }

    function renderDiff(targetEl, currentText, previousText) {
        if (!previousText) {
            const lines = decodeEntities(currentText).split('\n');
            targetEl.innerHTML = lines.map(l => getHighlightedString(l)).join('\n');
            return;
        }
        const currLines = decodeEntities(currentText).split('\n');
        const prevSet = new Set(decodeEntities(previousText).split('\n').map(l => l.trim()));
        let htmlOutput = '';
        for (let i = 0; i < currLines.length; i++) {
            const line = currLines[i];
            const highlighted = getHighlightedString(line);
            if (line.trim() && !prevSet.has(line.trim())) {
                htmlOutput += '<span class="diff-new">' + highlighted + '</span>\n';
            } else {
                htmlOutput += highlighted + '\n';
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

    // --- 3. MAIN INITIALIZATION ---
    function initApp() {
        buildUI();
        const stateNode = document.getElementById('app-state');
        const dataNode = document.getElementById('raw-data');
        if (!stateNode) { throw new Error("Missing #app-state node"); }

        let stateData;
        try { 
            stateData = JSON.parse(stateNode.textContent.replace(/\u00A0/g, ' ')); 
        } catch (err) { 
            throw new Error("JSON Parse Error in #app-state: " + err.message);
        }

        let rawData = { draft: "", prompt: "" };
        if (dataNode) {
            try { 
                rawData = JSON.parse(dataNode.textContent.replace(/\u00A0/g, ' ')); 
            } catch (err) { 
                // Regex JSON Recovery: Try replacing literal physical newlines with \n
                try {
                    const sanitized = dataNode.textContent.replace(/\u00A0/g, ' ').replace(/\n/g, '\\n').replace(/\r/g, '');
                    rawData = JSON.parse(sanitized);
                } catch(e2) {
                    throw new Error("JSON Parse Error in #raw-data payload. The LLM generated invalid JSON formatting.");
                }
            }
        }

        // --- MODEL DETECTION CHECK ---
        const reflexOut = stateData.meta.reflexOutput ? stateData.meta.reflexOutput.toString().trim().toUpperCase() : "";
        if (reflexOut !== "M") {
            setTimeout(() => {
                const loader = document.getElementById('sys-loader');
                const blocker = document.getElementById('fast-model-blocker');
                if (loader) loader.style.display = 'none';
                if (blocker) { blocker.classList.remove('hidden'); blocker.style.display = 'block'; }
            }, 800); 
            return; 
        }

        window.versions = stateData.versions || [];

        // Hydrate payloads into v1.0 and latest version
        if (window.versions.length >= 2) {
            // Replace escaped HTML backslashes used for JSON safety (e.g., \n into actual newline)
            let draftText = rawData.draft || "";
            let promptText = rawData.prompt || "";
            
            // If the JSON parser successfully parsed "\n", it is already converted to a literal newline. 
            // We just inject it.
            if (draftText) window.versions[0].content = draftText.trim();
            if (promptText) window.versions[window.versions.length - 1].content = promptText.trim();
        }

        document.getElementById('ui-gem-name').textContent = stateData.meta.gemName;
        document.getElementById('ui-obj').textContent = stateData.meta.coreObjective;
        document.getElementById('ui-logic').textContent = stateData.meta.globalPromptLogic;
        document.getElementById('ui-model').textContent = stateData.meta.recommendedModel;
        document.getElementById('ui-tool').textContent = stateData.meta.requiredTool;
        
        const path = stateData.meta.executionPath || 'A';
        document.getElementById('ui-path').textContent = path === 'A' ? 'Standard Prompt' : 'Custom Gem';
        
        const versionNum = stateData.meta.version || 'v7.10';
        const updateTitle = document.getElementById('ui-update-title');
        if (updateTitle) updateTitle.textContent = "Refinements Applied to " + versionNum + ":";

        const updatesList = document.getElementById('ui-updates-list');
        stateData.updates.forEach(u => {
            const li = document.createElement('li'); li.innerHTML = u; updatesList.appendChild(li);
        });

        const qContainer = document.getElementById('ui-questions-container');
        if (stateData.questions && qContainer) {
            stateData.questions.forEach((q, idx) => {
                let optionsHtml = '';
                q.options.forEach((opt, i) => {
                    optionsHtml += '<tr class="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700">' +
                        '<td class="p-4 align-top w-[45%]"><div class="flex items-start gap-4"><input type="radio" id="' + q.id + '-o' + i + '" name="' + q.id + '" value="' + opt.value + '" class="mt-1 cursor-pointer"><div><label for="' + q.id + '-o' + i + '" class="font-bold text-sky-600 dark:text-sky-400 text-sm cursor-pointer block mb-1">' + opt.label + '</label><p class="text-sm text-slate-500">' + opt.desc + '</p></div></div></td>' +
                        '<td class="p-4 text-sm align-top w-[55%] leading-relaxed"><span class="text-emerald-500 font-bold">Pro:</span> ' + opt.pro + '<br><span class="text-rose-500 font-bold mt-1 block">Con:</span> ' + opt.con + '</td>' +
                    '</tr>';
                });
                optionsHtml += '<tr class="bg-white dark:bg-slate-900"><td class="p-4 align-top" colspan="2"><div class="flex items-start gap-4"><input type="radio" id="' + q.id + '-oth" name="' + q.id + '" value="Other" class="mt-1 cursor-pointer"><div class="flex-grow"><label for="' + q.id + '-oth" class="font-bold text-sky-600 dark:text-sky-400 text-sm cursor-pointer block mb-1">Other:</label><input type="text" class="other-input w-full border-b border-gray-300 dark:border-gray-600 bg-transparent text-sm pb-1 outline-none focus:border-sky-500 transition-colors" placeholder="Type custom option..."></div></div></td></tr>';
                
                const qDiv = document.createElement('div');
                qDiv.className = "bg-white dark:bg-[#1e1f20] p-6 rounded-2xl border border-gray-200 dark:border-gray-700 question-table shadow-sm";
                qDiv.innerHTML = '<div class="mb-4"><h4 class="font-bold text-base text-slate-800 dark:text-slate-200">' + (idx + 1) + '. <span class="q-title-text">' + q.question + '</span></h4><p class="text-sm text-slate-500 mt-2">' + q.context + '</p></div><table class="w-full text-sm border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden"><tbody>' + optionsHtml + '</tbody></table>';
                qContainer.appendChild(qDiv);
            });
        }

        document.getElementById('setup-option-a').style.display = path === 'A' ? 'block' : 'none';
        document.getElementById('setup-option-b').style.display = path === 'B' ? 'block' : 'none';
        document.getElementById('path-a-preview').style.display = path === 'A' ? 'flex' : 'none';
        document.getElementById('path-b-kb').style.display = path === 'B' ? 'flex' : 'none';
        document.getElementById('setup-gem-name').textContent = stateData.meta.gemName;

        const updateFeedback = () => {
            let feedbackStr = '';
            document.querySelectorAll('.question-table').forEach((table, i) => {
                const checked = table.querySelector('input[type="radio"]:checked');
                const title = table.querySelector('.q-title-text').innerText;
                const answer = checked ? (checked.value === 'Other' ? (table.querySelector('.other-input').value || '______') : checked.value) : '______';
                feedbackStr += (i + 1) + '. ' + title + ': [ ' + answer + ' ]\n';
            });
            document.getElementById('feedback-summary').textContent = feedbackStr.trim() || 'Please select options above.';
        };
        document.addEventListener('change', ev => { if(ev.target.matches('input[type="radio"],.other-input')) updateFeedback(); });
        document.addEventListener('keyup', ev => { if(ev.target.matches('.other-input')) updateFeedback(); });

        window.currentVersionIndex = Math.max(0, window.versions.length - 1);
        window.updateVersionUI = () => {
            document.getElementById('v-prev-btn').disabled = window.currentVersionIndex <= 0;
            document.getElementById('v-next-btn').disabled = window.currentVersionIndex >= window.versions.length - 1;
            document.getElementById('v-display-label').textContent = window.versions[window.currentVersionIndex]?.id || ('v' + (window.currentVersionIndex + 1));
            
            const currentData = window.versions[window.currentVersionIndex]?.content || '';
            const prevData = window.currentVersionIndex > 0 ? window.versions[window.currentVersionIndex - 1]?.content : null;
            renderDiff(document.getElementById('gem-instructions'), currentData, prevData);
        };
        window.updateVersionUI();

        document.addEventListener('click', ev => {
            const btn = ev.target.closest('.action-btn');
            if (btn) {
                if (btn.dataset.action === 'copy-prompt') triggerCopy(document.getElementById('gem-instructions').innerText, btn.querySelector('.copy-label'));
                if (btn.dataset.action === 'copy-answers') triggerCopy(document.getElementById('feedback-summary').innerText, btn.querySelector('.copy-answers-label'));
                if (btn.dataset.action === 'copy-text') {
                    const targetId = btn.dataset.textTarget;
                    const textToCopy = document.getElementById(targetId).innerText;
                    triggerCopy(textToCopy, btn.querySelector('.copy-label'));
                }
                if (btn.dataset.action === 'theme-toggle') document.documentElement.classList.toggle('dark');
                if (btn.id === 'v-prev-btn') { window.currentVersionIndex--; window.updateVersionUI(); }
                if (btn.id === 'v-next-btn') { window.currentVersionIndex++; window.updateVersionUI(); }
            }

            const tab = ev.target.closest('.tab-btn');
            if (tab) {
                document.querySelectorAll('.tab-btn').forEach(x => { x.classList.remove('tab-active', 'text-sky-500', 'border-b-2', 'border-sky-500'); x.classList.add('text-gray-500'); });
                tab.classList.add('tab-active', 'text-sky-500', 'border-b-2', 'border-sky-500');
                tab.classList.remove('text-gray-500');
                document.getElementById('app-content-prompt').classList.toggle('hidden', tab.dataset.tab !== 'prompt');
                document.getElementById('app-content-setup').classList.toggle('hidden', tab.dataset.tab !== 'setup');
            }
        });

        // Hide boot overlay and show app
        setTimeout(() => {
            const overlay = document.getElementById('sys-boot-overlay');
            if(overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.style.display = 'none', 300);
            }
            const mainApp = document.getElementById('main-app-container');
            if(mainApp) {
                mainApp.classList.remove('hidden');
                mainApp.style.display = 'flex';
            }
        }, 500);
    }

    // Reliable boot sequence
    function bootstrap() {
        if (window.__gpa_booted) return;
        window.__gpa_booted = true;
        try {
            initApp();
        } catch(e) {
            // Trigger the global crash interceptor if initApp fails directly
            window.onerror(e.message, null, "initApp()", null, e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }
})();
