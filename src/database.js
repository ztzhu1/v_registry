import { ref } from "vue"
import { RegistryRequest } from './v_registry_server_pb';
import { VRegistryServerClient } from './v_registry_server_grpc_web_pb';
import { items, idIndexMap, currSession, candidateSessions, selected } from './status'

export const CLIENT = new VRegistryServerClient('http://localhost:8080', null, null);
export const currUser = ref('test_user')
export const currPath = ref('N121H09')

switchUser(currUser.value)

console.time('grpc-web');

export function switchUser(user) {
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

export function ls(callback, showUsers = false) {
    let request = new RegistryRequest();
    request.setMessage(currPath.value);

    if (showUsers) {
        CLIENT.getCollNames(request, {}, (err, response) => {
            if (err) {
                console.log(`Unexpected error for ls: code = ${err.code}` +
                    `, message = "${err.message}"`);
            } else {
                response['u'].push([])
                callback(response['u'])
            }
        });
    } else {

        CLIENT.ls(request, {}, (err, response) => {
            if (err) {
                console.log(`Unexpected error for ls: code = ${err.code}` +
                    `, message = "${err.message}"`);
            } else {
                callback(response['u'])
            }
        });
    }
}

export function switchAndRefresh(session) {
    console.log(session)
    selected.value = [];
    if (session == null) {
        currPath.value = "";
        currSession.value = `/`;
        refreshUI(true);
        return
    }
    let result = session.split("/");
    result = result.slice(1, result.length);
    let user = "";
    let path = null;

    if (result.length == 1) {
        user = result[0];
    } else {
        [user, ...path] = result;
        path = path.join("/");
    }
    if (user != currUser.value) {
        switchUser(user);
    }
    if (path == "" || path == null) {
        currPath.value = "";
        currSession.value = `/${user}`;
    } else {
        currPath.value = path;
        currSession.value = `/${user}/${path}`;
    }

    refreshUI();
}

export function refreshUI(showUsers = false) {
    ls((response) => {
        let i = 0;
        items.value = [];
        candidateSessions.value = []
        if (showUsers) {
            for (const user of response[0]) { candidateSessions.value.push(`/${user}`) }
        }
        for (const dirName of response[0]) {
            let item = {
                key: `folder.${dirName}`,
                value: null,
                id: `id${i}`,
            };
            items.value.push(item);
            idIndexMap[items.value[items.value.length - 1]["id"]] = i;
            if (!showUsers) {

                candidateSessions.value.push(`${currSession.value}/${dirName}`)
            }
            i++;
        }
        for (const keyName of response[1]) {
            let item = {
                key: `key.${keyName}`,
                value: null,
                id: `id${i}`,
            };
            items.value.push(item);
            idIndexMap[items.value[items.value.length - 1]["id"]] = i;
            i++;
        }
    }, showUsers);
}