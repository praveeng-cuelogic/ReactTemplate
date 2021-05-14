import axios from 'axios';

export const request = async (obj) => {
    let headers = {};
    // let authorization = localStorage.getItem('authorization');
    // if (authorization) headers['Authorization'] = authorization;
    try {
        if (obj.params) {
            for (let param in obj.params) {
                if (typeof obj.params[param] === 'undefined' || obj.params[param] === null) {
                    delete obj.params[param];
                }
            }
        }
        const response = await axios.create({
            baseURL: process.env.REACT_APP_SERVER_URL,
            headers: headers
        })(obj);
        return response.data;
    } catch (error) {
        if (error.response) {
            if (error.response.status == 401) {
               // GeneralFunctions.clearLocalStorage(true);
            }
            if (error.response.data && error.response.data.message) {
                throw Error(error.response.data.message);
            }
        } else {
            throw Error('Server error.');
        }
        throw Error('Internet error.');
    }
}