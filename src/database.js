import { ref } from "vue"
import { RegistryRequest, SaveKeyRequest, DeleteKeyRequest, DeleteFolderRequest } from './v_registry_server_pb';
import { VRegistryServerClient } from './v_registry_server_grpc_web_pb';
import { items, idIndexMap, currSession, candidateSessions, selected, dialog, dialogText, dialogItem, dialogTitle } from './status'

export const CLIENT = new VRegistryServerClient('http://localhost:8080', null, null);
export const currUser = ref('test_user')
export const currPath = ref('N121H09')
export const showUsers = ref(false)

switchUser(currUser.value)

console.time('grpc-web');

export function switchUser(user) {
    currUser.value = user;
}

export function ls(callback) {
    let request = new RegistryRequest();
    request.setUser(currUser.value);
    request.setMessage(currPath.value);

    if (showUsers.value) {
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
        showUsers.value = true;
        refreshUI();
        return
    }
    showUsers.value = false;
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

export function refreshUI(dialogKey = null) {
    ls((response) => {
        selected.value = [];
        let i = 0;
        items.value = [];
        candidateSessions.value = []
        if (showUsers.value) {
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
            if (!showUsers.value) {

                candidateSessions.value.push(`${currSession.value}/${dirName}`)
            }
            i++;
        }

        for (let j = 0; j < response[1].length; j++) {
            let key = response[1][j]
            let item = {
                key: `key.${key}`,
                value: response[2][j],
                id: `id${i}`,
            };
            items.value.push(item);
            idIndexMap[items.value[items.value.length - 1]["id"]] = i;
            if (dialogKey != null && dialogKey == key) {
                dialogText.value = item['value']
                dialogItem.value = item;
                dialogTitle.value = key;
                dialog.value = true;
            }

            i++;
        }
    });
}

export function saveKey(key, value) {
    let request = new SaveKeyRequest();
    request.setUser(currUser.value);
    request.setPath(currPath.value);
    request.setKey(key);
    request.setValue(value);

    CLIENT.saveKey(request, {}, (err, response) => {
        if (err) {
            console.log(`Unexpected error for saveKey: code = ${err.code}` +
                `, message = "${err.message}"`);
        } else {
            console.log(response['u'][0]);
        }
        refreshUI()
    });
}

export function deleteKey(keys) {
    let request = new DeleteKeyRequest();
    request.setUser(currUser.value);
    request.setPath(currPath.value);
    request.setKeysList(keys);

    CLIENT.deleteKey(request, {}, (err, response) => {
        if (err) {
            console.log(`Unexpected error for deleteKey: code = ${err.code}` +
                `, message = "${err.message}"`);
        } else {
            console.log(response['u'][0]);
        }
        refreshUI()
    });
}

export function deleteFolder(folderName) {
    let request = new DeleteFolderRequest();
    if (showUsers.value) {
        request.setUser(folderName);
        request.setPath("");
    } else {
        request.setUser(currUser.value);
        if (currPath.value == "") {
            request.setPath(folderName);
        } else {
            request.setPath(`${currPath.value}/${folderName}`);
        }
    }

    CLIENT.deleteFolder(request, {}, (err, response) => {
        if (err) {
            console.log(`Unexpected error for deleteFolder: code = ${err.code}` +
                `, message = "${err.message}"`);
        } else {
            console.log(response['u'][0]);
        }
        refreshUI()
    });
}

