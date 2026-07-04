// =============================================================
        //  LANGUAGES
        // =============================================================
        const LANGUAGES = [
            { code: "auto", name: "Detect language", flag: "🔍" },
            { code: "en", name: "English", flag: "🇬🇧" },
            { code: "bn", name: "Bengali", flag: "🇧🇩" },
            { code: "es", name: "Spanish", flag: "🇪🇸" },
            { code: "fr", name: "French", flag: "🇫🇷" },
            { code: "de", name: "German", flag: "🇩🇪" },
            { code: "it", name: "Italian", flag: "🇮🇹" },
            { code: "pt", name: "Portuguese", flag: "🇵🇹" },
            { code: "nl", name: "Dutch", flag: "🇳🇱" },
            { code: "ru", name: "Russian", flag: "🇷🇺" },
            { code: "pl", name: "Polish", flag: "🇵🇱" },
            { code: "tr", name: "Turkish", flag: "🇹🇷" },
            { code: "uk", name: "Ukrainian", flag: "🇺🇦" },
            { code: "sv", name: "Swedish", flag: "🇸🇪" },
            { code: "da", name: "Danish", flag: "🇩🇰" },
            { code: "no", name: "Norwegian", flag: "🇳🇴" },
            { code: "fi", name: "Finnish", flag: "🇫🇮" },
            { code: "el", name: "Greek", flag: "🇬🇷" },
            { code: "cs", name: "Czech", flag: "🇨🇿" },
            { code: "ro", name: "Romanian", flag: "🇷🇴" },
            { code: "hu", name: "Hungarian", flag: "🇭🇺" },
            { code: "bg", name: "Bulgarian", flag: "🇧🇬" },
            { code: "ar", name: "Arabic", flag: "🇸🇦" },
            { code: "he", name: "Hebrew", flag: "🇮🇱" },
            { code: "fa", name: "Persian", flag: "🇮🇷" },
            { code: "hi", name: "Hindi", flag: "🇮🇳" },
            { code: "ur", name: "Urdu", flag: "🇵🇰" },
            { code: "ta", name: "Tamil", flag: "🇮🇳" },
            { code: "te", name: "Telugu", flag: "🇮🇳" },
            { code: "th", name: "Thai", flag: "🇹🇭" },
            { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
            { code: "id", name: "Indonesian", flag: "🇮🇩" },
            { code: "ms", name: "Malay", flag: "🇲🇾" },
            { code: "tl", name: "Filipino", flag: "🇵🇭" },
            { code: "zh-CN", name: "Chinese (Simplified)", flag: "🇨🇳" },
            { code: "zh-TW", name: "Chinese (Traditional)", flag: "🇹🇼" },
            { code: "ja", name: "Japanese", flag: "🇯🇵" },
            { code: "ko", name: "Korean", flag: "🇰🇷" },
            { code: "sw", name: "Swahili", flag: "🇰🇪" },
            { code: "af", name: "Afrikaans", flag: "🇿🇦" },
        ];

        // =============================================================
        //  DOM REFS
        // =============================================================
        const $ = (id) => document.getElementById(id);
        const sourceSel = $("sourceLang");
        const targetSel = $("targetLang");
        const input = $("input");
        const output = $("output");
        const loader = $("loader");
        const counter = $("counter");
        const errEl = $("err");
        const statusEl = $("status");
        const copyBtn = $("copy");
        const swapBtn = $("swap");
        const speakSrc = $("speakSrc");
        const speakTgt = $("speakTgt");

        // =============================================================
        //  POPULATE SELECTS
        // =============================================================
        function populate(sel, includeAuto) {
            sel.innerHTML = "";
            LANGUAGES.forEach((l) => {
                if (!includeAuto && l.code === "auto") return;
                const opt = document.createElement("option");
                opt.value = l.code;
                opt.textContent = `${l.flag} ${l.name}`;
                sel.appendChild(opt);
            });
        }
        populate(sourceSel, true);
        populate(targetSel, false);
        sourceSel.value = "en";
        targetSel.value = "bn";

        // =============================================================
        //  STATE
        // =============================================================
        let controller = null;
        let timer = null;

        // =============================================================
        //  UPDATE STATUS
        // =============================================================
        function updateStatus() {
            const t = LANGUAGES.find((l) => l.code === targetSel.value);
            if (t) statusEl.textContent = `${t.flag} Translating to ${t.name}`;
        }
        updateStatus();

        // =============================================================
        //  TRANSLATE
        // =============================================================
        // Google Apps Script Web App URL (Paste your URL here)
        const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbywHlprDYYvRuv-_PukUn3IrJ8S6ofyDltBBnsS1Z0Z5Wi1_q5FPzfTY1OnHby_Rc2E_g/exec"; 

        async function translate() {
            errEl.textContent = "";
            const text = input.value.trim();
            counter.textContent = `${input.value.length} / 5000`;

            if (!text) {
                output.value = "";
                return;
            }

            if (controller) controller.abort();
            controller = new AbortController();
            loader.classList.remove("hidden");

            try {
                const src = sourceSel.value === "auto" ? "auto" : sourceSel.value;
                const tgt = targetSel.value;
                
                const cleanedText = text
                    .split(/\n\s*\n/)
                    .map(p => p.replace(/\n/g, ' '))
                    .join('\n\n');
                
                if (APPS_SCRIPT_URL && APPS_SCRIPT_URL.startsWith("https://script.google.com/")) {
                    // Use the High-Quality NMT API via Google Apps Script
                    const res = await fetch(APPS_SCRIPT_URL, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                        body: `q=${encodeURIComponent(cleanedText)}&sl=${encodeURIComponent(src)}&tl=${encodeURIComponent(tgt)}`,
                        signal: controller.signal
                    });
                    
                    const translatedText = await res.text();
                    output.value = translatedText;
                } else {
                    // Fallback to the old free API
                    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(src)}&tl=${encodeURIComponent(tgt)}&dt=t`;
                    
                    const res = await fetch(url, { 
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                        body: `q=${encodeURIComponent(cleanedText.slice(0, 5000))}`,
                        signal: controller.signal 
                    });
                    
                    const data = await res.json();
                    
                    if (data && data[0]) {
                        output.value = data[0]
                            .map(item => (item && item[0]) ? item[0] : "")
                            .join('');
                    } else {
                        output.value = "";
                    }
                }
            } catch (e) {
                if (e.name !== "AbortError") {
                    errEl.textContent = "Translation failed. Please try again.";
                    console.error("Translation error:", e);
                }
            } finally {
                loader.classList.add("hidden");
            }
        }

        function debounceTranslate() {
            clearTimeout(timer);
            timer = setTimeout(translate, 1200);
        }

        // =============================================================
        //  EVENTS — input / select
        // =============================================================
        input.addEventListener("input", debounceTranslate);
        sourceSel.addEventListener("change", () => { updateStatus();
            translate(); });
        targetSel.addEventListener("change", () => { updateStatus();
            translate(); });

        // =============================================================
        //  SWAP
        // =============================================================
        swapBtn.addEventListener("click", () => {
            if (sourceSel.value === "auto") return;
            const s = sourceSel.value;
            const t = targetSel.value;
            sourceSel.value = t;
            targetSel.value = s;
            const iv = input.value;
            const ov = output.value;
            input.value = ov;
            output.value = iv;
            counter.textContent = `${input.value.length} / 5000`;
            updateStatus();
            translate();
        });

        // =============================================================
        //  SPEAK
        // =============================================================
        function speak(text, lang) {
            if (!text || !window.speechSynthesis) return;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang === "auto" ? "en" : lang;
            speechSynthesis.cancel();
            speechSynthesis.speak(utterance);
        }

        speakSrc.addEventListener("click", () => speak(input.value, sourceSel.value));
        speakTgt.addEventListener("click", () => speak(output.value, targetSel.value));

        // =============================================================
        //  COPY  (3-tier fallback so it works everywhere)
        // =============================================================
        async function copyToClipboard(text) {
            // Method 1 — modern Clipboard API (works on HTTPS / localhost)
            if (navigator.clipboard && window.isSecureContext) {
                try {
                    await navigator.clipboard.writeText(text);
                    return true;
                } catch (_) { /* fall through */ }
            }

            // Method 2 — execCommand (legacy, works on file:// too)
            try {
                const ta = document.createElement("textarea");
                ta.value = text;
                ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                const ok = document.execCommand("copy");
                document.body.removeChild(ta);
                if (ok) return true;
            } catch (_) { /* fall through */ }

            // Method 3 — select the output textarea itself
            try {
                output.select();
                output.setSelectionRange(0, 99999);
                return document.execCommand("copy");
            } catch (_) {
                return false;
            }
        }

        copyBtn.addEventListener("click", async () => {
            const text = output.value.trim();
            if (!text) return;

            const ok = await copyToClipboard(text);
            const svg = copyBtn.querySelector("svg");

            if (ok) {
                // ✅ Success — show checkmark
                if (svg) {
                    const original = svg.innerHTML;
                    svg.innerHTML = `<path d="M20 6 9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
                    copyBtn.classList.add("success");
                    setTimeout(() => {
                        svg.innerHTML = original;
                        copyBtn.classList.remove("success");
                    }, 2000);
                }
            } else {
                // ❌ All methods failed — briefly show red to signal error
                copyBtn.style.color = "var(--danger, #f87171)";
                setTimeout(() => { copyBtn.style.color = ""; }, 1500);
            }
        });


        // =============================================================
        //  CHIPS
        // =============================================================
        document.querySelectorAll(".chip").forEach((chip) => {
            chip.addEventListener("click", () => {
                input.value = chip.textContent;
                counter.textContent = `${input.value.length} / 5000`;
                translate();
            });
        });

        // =============================================================
        //  THEME TOGGLE
        // =============================================================
        const themeToggleBtn = $("themeToggle");
        const sunIcon = themeToggleBtn.querySelector(".sun-icon");
        const moonIcon = themeToggleBtn.querySelector(".moon-icon");
        
        // Check for saved theme preference, otherwise use system preference
        const savedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        
        if (savedTheme === "light" || (!savedTheme && !prefersDark)) {
            document.documentElement.setAttribute("data-theme", "light");
            sunIcon.style.display = "none";
            moonIcon.style.display = "block";
        } else {
            // Default is dark mode in CSS
            sunIcon.style.display = "block";
            moonIcon.style.display = "none";
        }

        themeToggleBtn.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            if (currentTheme === "light") {
                document.documentElement.removeAttribute("data-theme");
                localStorage.setItem("theme", "dark");
                sunIcon.style.display = "block";
                moonIcon.style.display = "none";
            } else {
                document.documentElement.setAttribute("data-theme", "light");
                localStorage.setItem("theme", "light");
                sunIcon.style.display = "none";
                moonIcon.style.display = "block";
            }
        });

        // =============================================================
        //  INIT — translate if there's default text
        // =============================================================
        // (nothing by default)