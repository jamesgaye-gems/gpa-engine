/**
 * Gemini Prompt Architect (GPA) - Core Rendering Engine
 * Version: 7.19 (Pristine Standard)
 * Organization: JamesGaye-Gems
 */
(function() {
    // --- GLOBAL CRASH INTERCEPTOR ---
    window.onerror = function(msg, url, line, col, err) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = "position:fixed;top:0;left:0;width:100%;background:#7f1d1d;color:white;padding:25px;z-index:9999999;font-family:monospace;font-size:14px;box-shadow:0 10px 25px rgba(0,0,0,0.5);";
        errorDiv.innerHTML = "<strong>GPA ENGINE FATAL ERROR:</strong><br><br>Error: " + msg + "<br>Line: " + line + "<br><br>The Javascript code on GitHub contains a syntax error.";
        document.body.appendChild(errorDiv);
        return false;
    };

    function buildUI() {
        const wrapper = document.createElement('div');
        wrapper.className = "flex flex-col h-screen overflow-hidden items-center w-full relative bg-gray-100 dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 transition-colors duration-200";
        
        wrapper.innerHTML = `
        <div id="sys-boot-overlay" class="fixed inset-0 z-[999999] bg-[#131314] flex flex-col items-center justify-center p-8 text-center transition-opacity duration-300">
            <div id="sys-loader" class="p-10 bg-sky-500/5 border-2 border-sky-500/30 rounded-3xl shadow-xl w-full max-w-lg">
                <span class="material-symbols-outlined text-6xl text-sky-500 mb-4 animate-spin block">progress_activity</span>
                <h2 class="text-2xl font-black text-sky-600 uppercase tracking-widest mb-2">Initializing Architecture...</h2>
                <p class="text-gray-400">Hydrating Public GitHub Payload...</p>
            </div>
            <div id="fast-model-blocker" class="p-8 bg-red-500/5 dark:bg-red-900/10 border-2 border-red-500/30 rounded-3xl shadow-xl w-full max-w-2xl hidden" style="display: none;">
                <span class="material-symbols-outlined text-6xl text-red-500 mb-4 animate-pulse">error</span>
                <h2 class="text-2xl font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-2">Gemini Fast Model Detected</h2>
                <p class="text-gray-700 dark:text-gray-300 mb-2 text-lg leading-relaxed">This tool requires <strong>Gemini 3.1 Pro</strong>. The Fast model does not support this architectural fidelity.</p>
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
                        <div class="flex items-center space-x-6">
                            <button class="tab-btn tab-active pb-1 px-1 text-base font-semibold text-sky-500 border-b-2 border-sky-500" data-tab="prompt">System Prompt</button>
                            <button class="tab-btn pb-1 px-1 text-base font-semibold text-gray-500" data-tab="setup">Setup Instructions</button>
                        </div>
                    </div>
                    <div class="flex items-center justify-end space-x-3">
                        <button class="action-btn flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-full transition-all shadow-lg" data-action="copy-prompt">
                            <span class="material-symbols-outlined text-[18px]">content_copy</span> <span>Copy Prompt</span>
                        </button>
                        <button class="action-btn w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-[#282a2c]" data-action="theme-toggle">
                            <span class="material-symbols-outlined text-[22px]">light_mode</span>
                        </button>
                    </div>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto p-4 md:p-8">
                <div id="app-content-prompt" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div class="bg-blue-50/50 dark:bg-sky-900/10 border-2 border-sky-100 dark:border-sky-900/30 rounded-[28px] p-6 shadow-sm">
                            <h3 class="text-xl font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-4">Executive Summary</h3>
                            <ul class="space-y-4 text-sm md:text-base">
                                <li><strong class="text-sky-600 dark:text-sky-400 block">Core Objective:</strong> <span id="ui-obj">...</span></li>
                                <li><strong class="text-sky-600 dark:text-sky-400 block">Prompt Logic:</strong> <span id="ui-logic">...</span></li>
                            </ul>
                        </div>
                        <div class="bg-indigo-50/50 dark:bg-indigo-900/10 border-2 border-indigo-100 dark:border-indigo-900/30 rounded-[28px] p-6 shadow-sm">
                            <h3 class="text-xl font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">Deploy Info</h3>
                            <div class="grid grid-cols-2 gap-4">
                                <div><span class="block text-xs font-bold uppercase text-slate-500">Model</span><span class="font-semibold text-sm" id="ui-model">...</span></div>
                                <div><span class="block text-xs font-bold uppercase text-slate-500">Tool</span><span class="font-semibold text-sm" id="ui-tool">...</span></div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-[#1e1f20] rounded-[28px] p-6 shadow-xl border border-gray-200 dark:border-gray-700/50 flex flex-col h-[600px]">
                        <div class="flex items-center justify-between mb-4 border-b pb-3">
                            <h3 class="text-base font-bold uppercase tracking-widest">Optimized Prompt</h3>
                            <div class="flex items-center gap-2">
                                <button id="v-prev-btn" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-30"><span class="material-symbols-outlined">chevron_left</span></button>
                                <span id="v-display-label" class="text-xs font-bold font-mono">v1.0</span>
                                <button id="v-next-btn" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-30"><span class="material-symbols-outlined">chevron_right</span></button>
                            </div>
                        </div>
                        <div id="gem-instructions" class="outline-none whitespace-pre-wrap text-sm font-mono leading-relaxed overflow-auto flex-grow" contenteditable="true"></div>
                    </div>
                </div>

                <div id="app-content-setup" class="hidden max-w-3xl mx-auto py-8">
                    <div class="bg-white dark:bg-[#1e1f20] rounded-[28px] p-10 shadow-xl border border-gray-200">
                        <h3 class="text-2xl font-bold mb-6 text-sky-500">Restoration Guide</h3>
                        <p class="mb-4">The UI is now successfully served from GitHub Pages.</p>
                        <div class="p-5 bg-gray-50 dark:bg-slate-800 rounded-xl border-l-4 border-sky-500">
                            <span class="font-bold block mb-2">Step 1: Save Prompt</span>
                            Copy the optimized prompt from the first tab and save it as your Gem's Instruction set.
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        
        document.body.appendChild(wrapper);
    }

    function initApp() {
        const fallback = document.getElementById('fallback-boot-screen');
        if (fallback) fallback.remove();
        
        buildUI();
        const stateNode = document.getElementById('app-state');
        const dataNode = document.getElementById('raw-data');
        if (!stateNode || !dataNode) return;

        const stateData = JSON.parse(stateNode.textContent);
        const rawData = JSON.parse(dataNode.textContent);

        document.getElementById('ui-gem-name').textContent = stateData.meta.gemName;
        document.getElementById('ui-obj').textContent = stateData.meta.coreObjective;
        document.getElementById('ui-logic').textContent = stateData.meta.globalPromptLogic;
        document.getElementById('ui-model').textContent = stateData.meta.recommendedModel;
        document.getElementById('ui-tool').textContent = stateData.meta.requiredTool;

        const versions = [
            { id: "v1.0", content: rawData.draft || "No draft content provided." },
            { id: stateData.meta.version, content: rawData.prompt || "No optimized prompt generated." }
        ];

        let curIdx = versions.length - 1;
        const render = () => {
            document.getElementById('v-display-label').textContent = versions[curIdx].id;
            document.getElementById('gem-instructions').textContent = versions[curIdx].content;
            document.getElementById('v-prev-btn').disabled = curIdx === 0;
            document.getElementById('v-next-btn').disabled = curIdx === versions.length - 1;
        };

        document.getElementById('v-prev-btn').onclick = () => { if(curIdx > 0) { curIdx--; render(); } };
        document.getElementById('v-next-btn').onclick = () => { if(curIdx < versions.length -1) { curIdx++; render(); } };
        
        document.addEventListener('click', e => {
            const btn = e.target.closest('.action-btn');
            if (!btn) return;
            if (btn.dataset.action === 'copy-prompt') {
                const text = document.getElementById('gem-instructions').innerText;
                navigator.clipboard.writeText(text);
                const span = btn.querySelector('span:not(.material-symbols-outlined)');
                const old = span.textContent; span.textContent = "Copied!";
                setTimeout(() => span.textContent = old, 2000);
            }
            if (btn.dataset.action === 'theme-toggle') document.documentElement.classList.toggle('dark');
        });

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('tab-active', 'text-sky-500', 'border-b-2', 'border-sky-500'));
                btn.classList.add('tab-active', 'text-sky-500', 'border-b-2', 'border-sky-500');
                document.getElementById('app-content-prompt').classList.toggle('hidden', btn.dataset.tab !== 'prompt');
                document.getElementById('app-content-setup').classList.toggle('hidden', btn.dataset.tab !== 'setup');
            };
        });

        render();
        setTimeout(() => {
            document.getElementById('sys-boot-overlay').style.opacity = '0';
            setTimeout(() => document.getElementById('sys-boot-overlay').style.display = 'none', 300);
            document.getElementById('main-app-container').classList.remove('hidden');
            document.getElementById('main-app-container').style.display = 'flex';
        }, 500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
})();
