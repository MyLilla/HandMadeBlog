class Translator {
    constructor() {
        this.translations = {};
        this.data = {};
        this.currentLanguage = this.getSavedLanguage() || 'en';
        this.initTranslations();
        this.initData();
    }

    getSavedLanguage() {
        return localStorage.getItem('language');
    }

    saveLanguage(lang) {
        localStorage.setItem('language', lang);
    }

    async initTranslations() {
        try {
            const [enRes, ruRes] = await Promise.all([
                fetch('translations/en.json'),
                fetch('translations/ru.json')
            ]);
            this.translations.en = await enRes.json();
            this.translations.ru = await ruRes.json();
        } catch (error) {
            console.error('Error loading translations:', error);
        }
    }

    async initData() {
        try {
            const [enRes, ruRes] = await Promise.all([
                fetch('data-en.json'),
                fetch('data-ru.json')
            ]);
            this.data.en = await enRes.json();
            this.data.ru = await ruRes.json();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async waitForTranslations() {
        // Ждем загрузки переводов и данных
        while (Object.keys(this.translations).length === 0 || Object.keys(this.data).length === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    getProductData() {
        return this.data[this.currentLanguage] || this.data.en;
    }

    get(key, language = this.currentLanguage) {
        const keys = key.split('.');
        let value = this.translations[language];
        
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return key; // Если ключ не найден, вернуть сам ключ
            }
        }
        return value || key;
    }

    setLanguage(lang) {
        this.currentLanguage = lang;
        this.saveLanguage(lang);
        this.updatePageLanguage();
    }

    updatePageLanguage() {
        // Обновить HTML элементы с data-i18n атрибутом
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.get(key);
            el.innerHTML = translation;
        });

        // Обновить атрибуты aria-label
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria');
            const translation = this.get(key);
            el.setAttribute('aria-label', translation);
        });

        // Обновить alt текст
        document.querySelectorAll('[data-i18n-alt]').forEach(el => {
            const key = el.getAttribute('data-i18n-alt');
            const translation = this.get(key);
            el.setAttribute('alt', translation);
        });

        // Обновить placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translation = this.get(key);
            el.setAttribute('placeholder', translation);
        });

        // Обновить язык в HTML
        if (this.currentLanguage === 'ru') {
            document.documentElement.lang = 'ru';
        } else {
            document.documentElement.lang = 'en';
        }

        // Пересчитать размеры модального окна если оно открыто
        if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new Event('languageChanged'));
        }
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

// Инициализация переводчика
const translator = new Translator();

// Запустить обновление как можно скорее
translator.waitForTranslations().then(() => {
    translator.updatePageLanguage();
});

document.addEventListener('DOMContentLoaded', function () {
    // Обновить еще раз когда DOM готов
    translator.updatePageLanguage();
    
    // Обработчик кнопки переключения языка
    const languageToggle = document.getElementById('languageToggle');
    if (languageToggle) {
        languageToggle.addEventListener('click', function (e) {
            e.preventDefault();
            const newLang = translator.getCurrentLanguage() === 'en' ? 'ru' : 'en';
            translator.setLanguage(newLang);
        });
    }
});
