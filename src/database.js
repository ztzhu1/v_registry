import { ref } from "vue"
import { RegistryRequest } from './v_registry_server_pb';
import { VRegistryServerClient } from './v_registry_server_grpc_web_pb';

export const CLIENT = new VRegistryServerClient('http://localhost:8080', null, null);
export const currUser = ref('test_user')
export const currPath = ref('N121H09')

switchUser(currUser.value)

console.time('grpc-web');

function switchUser(user) {
    let request = new RegistryRequest();
    request.setMessage(user);

    CLIENT.switchUser(request, {}, (err, response) => {
        if (err) {
            console.log(`Unexpected error for switchUser: code = ${err.code}` +
                `, message = "${err.message}"`);
        } else {
            console.log(response['u'][0]);
        }
    });
    currUser.value = user;
}

export function ls(callback) {
    let request = new RegistryRequest();
    request.setMessage(currPath.value);

    CLIENT.ls(request, {}, (err, response) => {
        if (err) {
            console.log(`Unexpected error for ls: code = ${err.code}` +
                `, message = "${err.message}"`);
        } else {
            callback(response['u'])
        }
    });
}