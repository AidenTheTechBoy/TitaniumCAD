import { toast } from 'react-toastify';

const Config = {

    // API Keys
    api: process.env.REACT_APP_BACKEND_URL,
    stripe_public: process.env.REACT_APP_STRIPE_PUBLIC_KEY,

    //Toast Layouts
    toastSuccess (message, time = 3000) {
        toast.dark(message, {
            position: "top-right",
            autoClose: time,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        })
    },

    toastFailure (message, time = 3000) {
        toast.error(message, {
            position: "top-right",
            autoClose: time,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        })
    },

}

export default Config