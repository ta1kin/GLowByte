export const mainRoutes = {
    preview: '/',
    home: {
        global: '/home',
        inner: {
            estimation: 'estimation',
            education: 'education',
            history: 'history',
        },
    },
    error: '/error',
    notFound: '*',
};

export const previewRoute = mainRoutes.preview;

export const homeGlobRoute = mainRoutes.home.global;
export const homeInnerRoutes = mainRoutes.home.inner;

export const estimationRoute = `${homeGlobRoute}/${homeInnerRoutes.estimation}`;
export const educationRoute = `${homeGlobRoute}/${homeInnerRoutes.education}`;
export const historyRoute = `${homeGlobRoute}/${homeInnerRoutes.history}`;

export const errorRoute = mainRoutes.error;
export const notFoundRoute = mainRoutes.notFound;

export default mainRoutes