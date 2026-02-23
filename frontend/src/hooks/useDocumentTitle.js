import { useEffect } from 'react';

const BASE_TITLE = 'Journalite';

/**
 * Sets the document title while the component is mounted.
 * Restores the default title from index.html on unmount.
 *
 * @param {string} pageTitle – e.g. "Dashboard", "My Journal"
 *   result → "Dashboard | Journalite"
 *   pass empty/null to use the default landing page title.
 */
const useDocumentTitle = (pageTitle) => {
    useEffect(() => {
        const defaultTitle = 'Journalite - AI-Powered Journalling Platform';
        document.title = pageTitle ? `${pageTitle} | ${BASE_TITLE}` : defaultTitle;

        return () => {
            document.title = defaultTitle;
        };
    }, [pageTitle]);
};

export default useDocumentTitle;
