import { ref } from "vue"
import { RegistryRequest, SaveKeyRequest, DeleteKeyRequest, DirRequest, CopyKeyRequest, CopyDirRequest, StringRequest } from './v_registry_server_pb';
import { VRegistryServerClient } from './v_registry_server_grpc_web_pb';
import { items, idIndexMap, currSession, candidateSessions, selected, dialog, dialogText, dialogItem, dialogTitle, drawerItems } from './status'
// import axios from 'axios';

export const CLIENT = new VRegistryServerClient('http://localhost:8080', null, null);
export const currUser = ref('')
export const currPath = ref('')
export const showUsers = ref(true)

switchUser(currUser.value)


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
    refreshDrawerItems(session)
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
            alert(`Unexpected error for saveKey: code = ${err.code}` +
                `, message = "${err.message}"`);
        } else {
            console.log(response['u'][0]);
        }
        refreshUI()
    });
}

export function copyKey(oldUser, oldPath, newUser, newPath, key) {
    let request = new CopyKeyRequest();
    request.setOlduser(oldUser);
    request.setOldpath(oldPath);
    request.setNewuser(newUser);
    request.setNewpath(newPath);
    request.setName(key);

    CLIENT.copyKey(request, {}, (err, response) => {
        if (err) {
            alert(`Unexpected error for copyKey: code = ${err.code}` +
                `, message = "${err.message}"`);
        } else {
            console.log(response['u'][0]);
        }
        refreshUI()
    });
}

export function copyDir(oldUser, oldPath, newUser, newPath) {
    let request = new CopyDirRequest();
    request.setOlduser(oldUser);
    request.setOldpath(oldPath);
    request.setNewuser(newUser);
    request.setNewpath(newPath);

    CLIENT.copyDir(request, {}, (err, response) => {
        if (err) {
            alert(`Unexpected error for copyDir: code = ${err.code}` +
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

export function deleteDir(folderName) {
    let request = new DirRequest();
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

    CLIENT.deleteDir(request, {}, (err, response) => {
        if (err) {
            console.log(`Unexpected error for deleteDir: code = ${err.code}` +
                `, message = "${err.message}"`);
        } else {
            console.log(response['u'][0]);
        }
        refreshUI()
    });
}


export function newDir(folderName) {
    let request = new DirRequest();
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

    CLIENT.newDir(request, {}, (err, response) => {
        if (err) {
            console.log(`Unexpected error for newDir: code = ${err.code}` +
                `, message = "${err.message}"`);
        } else {
            console.log(response['u'][0]);
        }
        refreshUI()
    });
}

export function refreshDrawerItems(session) {
    let request = new StringRequest();
    if (session == null) {
        session = "/"
    }
    request.setMessage(session);

    CLIENT.latestSessions(request, {}, (err, response) => {
        if (err) {
            console.log(`Unexpected error for datestSessions: code = ${err.code}` +
                `, message = "${err.message}"`);
        } else {
            drawerItems.value = []
            for (const session of response['u'][0]) {
                drawerItems.value.push({ 'title': session })
            }
        }
    });
}


// export function getUserIP() {
//     try {
//         const response = axios.get('https://api.ipify.org?format=json');
//         this.userIP = response.data.ip;
//     } catch (error) {
//         console.error('Error fetching IP address:', error);
//     }
// }