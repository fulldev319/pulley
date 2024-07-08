const msgpack = require('./msgpack.min.js');

const rootURL = "https://ciphersprint.pulley.com";
const email = "sean.z.boland@gmail.com";

const _base64ToArrayBuffer = (base64) => {
    var binary_string = atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
};

const decode = (data) => {
    var after = msgpack.decode(data);
    if (typeof after === "object") {
      Object.keys(after).map((key) => {
        try {
          var afterafter = msgpack.decode(after[key]);
          if (typeof afterafter === "object") after[key] = afterafter;
        } catch (err) {}
      });
    }
    return after;
};

const decodeBase64 = (text) => {
    let decoded = decode(_base64ToArrayBuffer(text));
    return decoded;
};


async function fetchData(url) {
    let response = await fetch(url);
    let result = await response.json();
    return result;
}

async function firstStep() {
    let result = await fetchData(`${rootURL}/${email}`);
    console.log(result);
    return result['encrypted_path'];
}

async function secondStep() {
    const nextPath = await firstStep();
    let result = await fetchData(`${rootURL}/${nextPath}`);
    console.log(result);
    return atob(result['encrypted_path'].split("_")[1]);
}

async function thirdStep() {
    const nextPath = await secondStep();
    let result = await fetchData(`${rootURL}/task_${nextPath}`);
    console.log(result);
    let encryptedPath = result['encrypted_path'].split("_")[1];
    let i, len = encryptedPath.length, resultPath = "";
    for (i = 0; i < len; i += 2) {
        if (i + 1 < len) resultPath += encryptedPath[i + 1];
        resultPath += encryptedPath[i];
    }
    return resultPath;
}

async function fourthStep() {
    const nextPath = await thirdStep();
    let result = await fetchData(`${rootURL}/task_${nextPath}`);
    console.log(result);
    let encryptedPath = result['encrypted_path'].split("_")[1];
    let params = result['encryption_method'].split(" ");
    let encryptedPathLength = encryptedPath.length;
    let rotationParam = parseInt(params[params.length - 1]) % encryptedPathLength;
    let resultPath = encryptedPath.slice(encryptedPathLength - rotationParam) + encryptedPath.slice(0, encryptedPathLength - rotationParam);
    return resultPath;
}

async function fifthStep() {
    const nextPath = await fourthStep();
    let result = await fetchData(`${rootURL}/task_${nextPath}`);

    let encryptedPath = result['encrypted_path'].split("_")[1];
    let params = result['encryption_method'].split(" ");
    let encryptedPathLength = encryptedPath.length;
    let hexParam = params[params.length - 1];

    let hexCharacters = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
    let charMapping = {};

    let resultPath = "", i, len = encryptedPath.length;

    for (i = 0; i < 16; i++) {
        charMapping[hexParam[i]] = hexCharacters[i];
    }

    for (i = 0; i < len; i++) {
        resultPath += charMapping[encryptedPath[i]];
    }

    console.log(result);
    return resultPath;
}

async function sixthStep() {
    const nextPath = await fifthStep();
    let result = await fetchData(`${rootURL}/task_${nextPath}`);

    let encryptedPath = result['encrypted_path'].split("_")[1];
    let params = result['encryption_method'].split(" ");
    let encryptedPathLength = encryptedPath.length;
    let messagePack = params[params.length - 1];

    let mappingInfo = decodeBase64(messagePack);
    let mapping = {};
    
    mappingInfo.forEach((pos, ind) => {
        mapping[pos] = ind;
    })

    let i, len = encryptedPath.length, resultPath = "";
    for (i = 0; i < len; i++) {
        resultPath += encryptedPath[mapping[i]];
    }

    console.log(result);
    return resultPath;
}

async function seventhStep() {
    const nextPath = await sixthStep();
    let result = await fetchData(`${rootURL}/task_${nextPath}`);

    console.log(result);
    return result;
}

seventhStep();