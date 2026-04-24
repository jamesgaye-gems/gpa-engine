console.log("[GPA Engine] v8.0 - DOM Textarea Architecture Booting...");

(function() {
    // --- GLOBAL CRASH INTERCEPTOR ---
    window.onerror = function(msg, url, line, col, err) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = "position:fixed;top:0;left:0;width:100%;background:#7f1d1d;color:white;padding:25px;z-index:9999999;font-family:monospace;font-size:14px;box-shadow:0 10px 25px rgba(0,0,0,0.5);";
        errorDiv.innerHTML = "<strong>GPA ENGINE FATAL ERROR:</strong><br><br>Error: " + msg + "<br>Line: " + line + "<br><br>The Javascript engine encountered an unexpected syntax crash.";
        document.body.appendChild(errorDiv);
        return false;
    };

    function buildUI() {
        const wrapper = document.createElement('div');
        wrapper.className = "flex flex-col h-screen overflow-hidden items-center w-full relative bg-gray-100 dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 transition-colors duration-200";
        
        const uiHTML = [
            '<div id="sys-boot-overlay" class="fixed inset-0 z-[999999] bg-[#131314] flex flex-col items-center justify-center p-8 text-center transition-opacity duration-300">',
                '<div id="sys-loader" class="p-10 bg-sky-500/5 border-2 border-sky-500/30 rounded-3xl shadow-xl w-full max-w-lg">',
                    '<span class="material-symbols-outlined text-6xl text-sky-500 mb-4 animate-spin block">progress_activity</span>',
                    '<h2 class="text-2xl font-black text-sky-600 uppercase tracking-widest mb-2">Initializing Architecture...</h2>',
                    '<p class="text-gray-400">Extracting DOM Payloads...</p>',
                '</div>',
                '<div id="fast-model-blocker" class="p-8 bg-red-500/5 dark:bg-red-900/10 border-2 border-red-500/30 rounded-3xl shadow-xl w-full max-w-2xl hidden" style="display: none;">',
                    '<span class="material-symbols-outlined text-6xl text-red-500 mb-4 animate-pulse">error</span>',
                    '<h2 class="text-2xl font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-2">Gemini Fast Model Detected</h2>',
                    '<p class="text-gray-700 dark:text-gray-300 mb-2 text-lg leading-relaxed">This tool requires <strong>Gemini 3.1 Pro</strong> to render the UI correctly.</p>',
                '</div>',
            '</div>',
            '<div id="main-app-container" class="max-w-[1250px] w-full flex-col h-full bg-[#f0f4f9] dark:bg-[#131314] shadow-2xl border-x border-gray-300 dark:border-gray-800 hidden">',
                '<div class="shrink-0 z-50 border-b border-gray-200 dark:border-gray-800 px-4 py-4 md:px-8 shadow-sm">',
                    '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">',
                        '<div class="flex items-center gap-4">',
                            '<div class="flex items-center gap-2 text-slate-800 dark:text-slate-100">',
                                '<span class="material-symbols-outlined text-sky-500 text-[28px]">design_services</span>',
                                '<span id="ui-gem-name" class="font-black text-xl hidden sm:block">Gemini Prompt Architect</span>',
                            '</div>',
                            '<div class="w-px h-8 bg-gray-300 dark:bg-gray-700 hidden sm:block"></div>',
                            '<div class="flex items-center space-x-6 w-full md:w-auto overflow-x-auto no-scrollbar">',
                                '<button class="tab-btn tab-active pb-1 px-1 text-base font-semibold text-sky-500 border-b-2 border-sky-500 whitespace-nowrap" data-tab="prompt">System Prompt & Feedback</button>',
                                '<button class="tab-btn pb-1 px-1 text-base font-semibold text-gray-500 whitespace-nowrap" data-tab="setup">Setup Instructions</button>',
                            '</div>',
                        '</div>',
                        '<div class="flex items-center justify-end space-x-3 shrink-0">',
                            '<button class="action-btn flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-full transition-all shadow-lg focus:outline-none whitespace-nowrap" data-action="copy-prompt">',
                                '<span class="material-symbols-outlined text-[18px] pointer-events-none">content_copy</span> <span class="copy-label pointer-events-none">Copy Prompt</span>',
                            '</button>',
                            '<button class="action-btn w-10 h-10 flex items-center justify-center bg-transparent hover:bg-gray-200 dark:hover:bg-[#282a2c] rounded-full transition-colors focus:outline-none" data-action="theme-toggle">',
                                '<span class="material-symbols-outlined text-[22px] pointer-events-none">light_mode</span>',
                            '</button>',
                        '</div>',
                    '</div>',
                '</div>',
                '<div class="flex-1 overflow-y-auto"><div class="p-4 md:p-8 pt-4">',
                    '<div id="app-content-prompt" class="space-y-6 mt-4">',
                        '<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">',
                            '<div class="bg-blue-50/50 dark:bg-sky-900/10 border-2 border-sky-100 dark:border-sky-900/30 rounded-[28px] p-6 md:p-8 shadow-sm flex flex-col">',
                                '<h3 class="text-xl font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-4 flex items-center gap-3"><span class="material-symbols-outlined text-[24px]">analytics</span> Executive Summary</h3>',
                                '<div class="text-sm md:text-base text-gray-700 dark:text-gray-300 flex-grow"><ul class="list-none space-y-4 mb-6">',
                                    '<li><strong class="text-sky-600 dark:text-sky-400 block mb-1">Core Objective:</strong> <span id="ui-obj" class="block leading-relaxed">...</span></li>',
                                    '<li><strong class="text-sky-600 dark:text-sky-400 block mb-1">Prompt Logic:</strong> <span id="ui-logic" class="block leading-relaxed">...</span></li>',
                                '</ul></div>',
                                '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-sky-200 dark:border-sky-800 mt-auto">',
                                    '<div><span class="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Recommended Model</span><span class="font-semibold text-sm text-sky-700 dark:text-sky-300" id="ui-model">...</span></div>',
                                    '<div><span class="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Required Tool</span><span class="font-semibold text-sm text-sky-700 dark:text-sky-300" id="ui-tool">...</span></div>',
                                    '<div><span class="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Execution Path</span><span class="font-semibold text-sm text-sky-700 dark:text-sky-300" id="ui-path">...</span></div>',
                                '</div>',
                            '</div>',
                            '<div class="bg-indigo-50/50 dark:bg-indigo-900/10 border-2 border-indigo-100 dark:border-indigo-900/30 rounded-[28px] p-6 md:p-8 shadow-sm flex flex-col">',
                                '<h3 class="text-xl font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-3"><span class="material-symbols-outlined text-[24px]">update</span> Updates & Upgrades</h3>',
                                '<div class="text-sm md:text-base text-gray-700 dark:text-gray-300 flex-grow">',
                                    '<p class="mb-4 font-bold text-indigo-500 text-base" id="ui-update-title"></p>',
                                    '<ul class="list-disc pl-5 space-y-3 leading-relaxed" id="ui-updates-list"></ul>',
                                '</div>',
                            '</div>',
                        '</div>',
                        '<hr class="border-sky-200 dark:border-sky-800/50 my-8">',
                        '<h3 class="text-xl font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-4 flex items-center gap-3"><span class="material-symbols-outlined text-[24px]">tune</span> Surgical Questions</h3>',
                        '<div id="ui-questions-container" class="space-y-6"></div>',
                        '<div class="mt-8 bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">',
                            '<div class="flex items-center justify-start gap-4 mb-4">',
                                '<h4 class="font-bold text-slate-800 dark:text-slate-200 text-base flex items-center gap-2"><span class="material-symbols-outlined text-sky-500 text-[20px]">chat</span> Feedback Summary</h4>',
                                '<button class="action-btn flex items-center gap-1 px-4 py-1.5 text-sm font-bold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded transition-colors focus:outline-none whitespace-nowrap" data-action="copy-answers"><span class="material-symbols-outlined text-[16px] pointer-events-none">content_copy</span> <span class="pointer-events-none copy-answers-label">Copy Answers</span></button>',
                            '</div>',
                            '<div id="feedback-summary" class="font-mono text-sm text-slate-600 dark:text-slate-400 outline-none whitespace-pre-wrap p-4 bg-gray-50 dark:bg-[#18191a] rounded leading-relaxed" contenteditable="true" spellcheck="false">Please select options above.</div>',
                        '</div>',
                        '<div class="flex flex-col md:flex-row gap-6 md:h-[750px] mt-8">',
                            '<div class="flex-[1.4] min-w-[320px] bg-white dark:bg-[#1e1f20] rounded-[28px] p-6 shadow-xl border border-gray-200 dark:border-gray-700/50 flex flex-col overflow-hidden">',
                                '<div class="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700 pb-3 shrink-0">',
                                    '<h3 class="text-base font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Optimized Prompt</h3>',
                                    '<div id="version-controls" class="items-center gap-1 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-lg flex">',
                                        '<button id="v-prev-btn" class="action-btn flex items-center justify-center w-7 h-7 rounded transition-colors text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"><span class="material-symbols-outlined text-[18px] pointer-events-none">chevron_left</span></button>',
                                        '<span id="v-display-label" class="text-xs font-bold px-3 text-slate-700 dark:text-slate-300 min-w-[50px] text-center">...</span>',
                                        '<button id="v-next-btn" class="action-btn flex items-center justify-center w-7 h-7 rounded transition-colors text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"><span class="material-symbols-outlined text-[18px] pointer-events-none">chevron_right</span></button>',
                                    '</div>',
                                '</div>',
                                '<div id="gem-instructions" class="outline-none whitespace-pre-wrap text-sm font-mono leading-relaxed text-gray-800 dark:text-gray-200 overflow-auto flex-grow" contenteditable="true" spellcheck="false"></div>',
                            '</div>',
                            '<div id="path-b-kb" class="hidden flex-1 min-w-[320px] bg-gray-50 dark:bg-[#18191a] rounded-[28px] p-6 shadow-inner border border-gray-200 dark:border-gray-700/50 flex-col overflow-hidden">',
                                '<div class="flex flex-col h-full"><h3 class="text-base font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-4 border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center gap-2 shrink-0"><span class="material-symbols-outlined text-[20px]">folder_zip</span> Gem Knowledge Base</h3><div class="overflow-auto flex-grow"><p class="mb-5 text-sm italic opacity-80 text-gray-500">Download or copy templates required for this Gem.</p><div id="ui-kb-templates-container"></div></div></div>',
                            '</div>',
                            '<div id="path-a-preview" class="hidden flex-1 min-w-[320px] bg-gray-50 dark:bg-[#18191a] rounded-[28px] p-6 shadow-inner border border-gray-200 dark:border-gray-700/50 flex-col overflow-hidden">',
                                '<h3 class="text-base font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4 border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center gap-2"><span class="material-symbols-outlined text-[20px]">visibility</span> Standard Execution</h3><div class="text-sm text-gray-700 dark:text-gray-400 flex-grow leading-relaxed">This is a standard prompt intended for immediate execution in the chat window, not a Custom Gem. Copy the prompt from the left panel and paste it into a new chat.</div>',
                            '</div>',
                        '</div>',
                    '</div>',
                    '<div id="app-content-setup" class="hidden pb-12">',
                        '<div class="max-w-3xl mx-auto bg-white dark:bg-[#1e1f20] rounded-[28px] p-8 md:p-10 border border-gray-200 dark:border-gray-700 shadow-xl mt-8">',
                            '<h3 class="text-2xl font-bold mb-8 flex items-center gap-3 text-sky-500"><span class="material-symbols-outlined text-[28px]">rocket_launch</span> Deployment Guide</h3>',
                            '<div class="space-y-6 text-base text-gray-700 dark:text-gray-300">',
                                '<div id="setup-option-a" class="hidden">',
                                    '<h4 class="font-bold text-slate-400 text-sm uppercase tracking-widest mt-4 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Standard Prompt Execution</h4>',
                                    '<div class="p-5 bg-gray-50 dark:bg-slate-800 rounded-xl mb-4 shadow-sm"><span class="font-bold text-emerald-500 block mb-2 underline text-xs">Step 1: Copy Prompt</span>Return to the <strong>System Prompt</strong> tab and copy the optimized prompt.</div>',
                                '</div>',
                                '<div id="setup-option-b" class="hidden">',
                                    '<h4 class="font-bold text-slate-400 text-sm uppercase tracking-widest mt-4 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Custom Gem Setup</h4>',
                                    '<div class="p-5 bg-gray-50 dark:bg-slate-800 rounded-xl mb-4 shadow-sm"><span class="font-bold text-sky-500 block mb-2 underline text-xs">Step 1: Gem Creation</span>Click on <span class="inline-block bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 px-3 py-1 rounded-full text-xs font-bold">+ New Gem</span> in the sidebar.</div>',
                                    '<div class="p-5 bg-gray-50 dark:bg-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 shadow-sm"><div><span class="font-bold text-sky-500 block mb-2 underline text-xs">Step 2: Name the Gem</span><span id="setup-gem-name" class="font-mono text-lg font-semibold text-slate-800 dark:text-white"></span></div><button class="action-btn flex items-center gap-1 px-4 py-2 text-sm font-bold bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-800/50 rounded-lg transition-colors focus:outline-none" data-action="copy-text" data-text-target="setup-gem-name"><span class="material-symbols-outlined text-[18px] pointer-events-none">content_copy</span> <span class="copy-label pointer-events-none">Copy Name</span></button></div>',
                                '</div>',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div></div>',
            '</div>'
        ].join('');
        
        wrapper.innerHTML = uiHTML;
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

    // --- 3. MAIN INITIALIZATION ---
    function initApp() {
        const fallback = document.getElementById('fallback-boot-screen');
        if (fallback) fallback.remove();
        
        buildUI();

        // Safe Config Parsing
        const stateNode = document.getElementById('app-state');
        let stateData;
        try { 
            stateData = JSON.parse(stateNode.textContent); 
        } catch (err) { 
            throw new Error("Failed to parse #app-state JSON config.");
        }

        // NEW DOM TEXTAREA EXTRACTION (Bulletproof)
        const draftInput = document.getElementById('raw-draft-payload');
        const promptInput = document.getElementById('raw-prompt-payload');
        const draftText = draftInput ? draftInput.value.trim() : "";
        const promptText = promptInput ? promptInput.value.trim() : "";

        // UI Dashboard Population
        document.getElementById('ui-gem-name').textContent = stateData.meta.gemName;
        document.getElementById('ui-obj').textContent = stateData.meta.coreObjective;
        document.getElementById('ui-logic').textContent = stateData.meta.globalPromptLogic;
        document.getElementById('ui-model').textContent = stateData.meta.recommendedModel;
        document.getElementById('ui-tool').textContent = stateData.meta.requiredTool;
        
        const path = stateData.meta.executionPath || 'A';
        document.getElementById('ui-path').textContent = path === 'A' ? 'Standard Prompt' : 'Custom Gem';
        
        const versionNum = stateData.meta.version || 'v8.0';
        const updateTitle = document.getElementById('ui-update-title');
        if (updateTitle) updateTitle.textContent = "Refinements Applied to " + versionNum + ":";

        const updatesList = document.getElementById('ui-updates-list');
        if (stateData.updates) {
            stateData.updates.forEach(u => {
                const li = document.createElement('li'); li.innerHTML = u; updatesList.appendChild(li);
            });
        }

        window.versions = [
            { id: "v1.0", content: draftText },
            { id: versionNum, content: promptText }
        ];

        let curIdx = window.versions.length - 1;
        const updateVersionUI = () => {
            document.getElementById('v-display-label').textContent = window.versions[curIdx].id;
            const currentData = window.versions[curIdx]?.content || '';
            const prevData = curIdx > 0 ? window.versions[curIdx - 1]?.content : null;
            renderDiff(document.getElementById('gem-instructions'), currentData, prevData);
            document.getElementById('v-prev-btn').disabled = curIdx === 0;
            document.getElementById('v-next-btn').disabled = curIdx === window.versions.length - 1;
        };

        updateVersionUI();

        document.getElementById('v-prev-btn').onclick = () => { if(curIdx > 0) { curIdx--; updateVersionUI(); } };
        document.getElementById('v-next-btn').onclick = () => { if(curIdx < window.versions.length - 1) { curIdx++; updateVersionUI(); } };

        document.addEventListener('click', ev => {
            const btn = ev.target.closest('.action-btn');
            if (btn) {
                if (btn.dataset.action === 'copy-prompt') {
                    navigator.clipboard.writeText(document.getElementById('gem-instructions').innerText);
                    const span = btn.querySelector('.copy-label');
                    const orig = span.textContent; span.textContent = 'Copied!';
                    setTimeout(() => span.textContent = orig, 2000);
                }
                if (btn.dataset.action === 'theme-toggle') document.documentElement.classList.toggle('dark');
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

        setTimeout(() => {
            const o = document.getElementById('sys-boot-overlay');
            if(o) { o.style.opacity = '0'; setTimeout(() => o.style.display = 'none', 300); }
            const m = document.getElementById('main-app-container');
            if(m) { m.classList.remove('hidden'); m.style.display = 'flex'; }
        }, 500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
})();
