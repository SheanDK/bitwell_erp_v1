import { useOutletContext } from 'react-router-dom';
import { translations } from '../utils/translations';

export const useTranslation = (providedLang) => {
    // If not used within an Outlet context, allow passing lang directly (e.g. for Sidebar)
    let lang = providedLang;
    
    try {
        const context = useOutletContext();
        if (context && context.lang) {
            lang = context.lang;
        }
    } catch (e) {
        // useOutletContext throws if outside Router/Outlet, fallback to 'en'
    }

    if (!lang) lang = 'en';

    const t = (key) => {
        const keys = key.split('.');
        
        let value = translations[lang] || translations['en'];
        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) break;
        }

        if (value === undefined) {
            value = translations['en'];
            for (const k of keys) {
                value = value?.[k];
                if (value === undefined) break;
            }
        }
        
        return value || key; 
    };

    return { t, lang };
};
