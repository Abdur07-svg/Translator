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
        async function translate() {
            errEl.textContent = "";
            const text = input.value.trim();
            counter.textContent = `${input.value.length} / 500`;

            if (!text) {
                output.value = "";
                return;
            }

            if (controller) controller.abort();
            controller = new AbortController();
            loader.classList.remove("hidden");

            try {
                const src = sourceSel.value === "auto" ? "autodetect" : sourceSel.value;
                const tgt = targetSel.value;
                const url =
                    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=${encodeURIComponent(src)}|${encodeURIComponent(tgt)}`;
                const res = await fetch(url, { signal: controller.signal });
                const data = await res.json();
                output.value = data?.responseData?.translatedText ?? "";
            } catch (e) {
                if (e.name !== "AbortError") {
                    errEl.textContent = "Translation failed. Please try again.";
                }
            } finally {
                loader.classList.add("hidden");
            }
        }

        function debounceTranslate() {
            clearTimeout(timer);
            timer = setTimeout(translate, 400);
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
            counter.textContent = `${input.value.length} / 500`;
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
                counter.textContent = `${input.value.length} / 500`;
                translate();
            });
        });

        // =============================================================
        //  INIT — translate if there's default text
        // =============================================================
        // (nothing by default)