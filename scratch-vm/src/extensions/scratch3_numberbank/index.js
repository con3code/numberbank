/*

    NumberBank1.0
    Scratch3.0 Extension

    Web:
    https://con3.com/numberbank/

*/


const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');

const formatMessage = require('format-message');
const Variable = require('../../engine/variable');
const { Crypto } = require("@peculiar/webcrypto");
const crypto = new Crypto();

const { initializeApp, deleteApp } = require('firebase/app');
const firestore = require('firebase/firestore');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');


// import { initializeApp, deleteApp } from 'firebase/app';
// import * as firestore from 'firebase/firestore/lite';
// import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore/lite';

//const firebase = require("firebase/app");
//require("firebase/firestore");


const encoder = new TextEncoder();
const deoder_utf8 = new TextDecoder('utf-8');

const EXTENSION_ID = 'numberbank';
const extVersion = "NumberBank1.0";


/**
 * URL to get this extension as a module.
 * When it was loaded as a module, 'extensionURL' will be replaced a URL which is retrieved from.
 * @type {string}
 */
 let extensionURL = 'https://con3office.github.io/xcx-numberbank/dist/numberbank.mjs';



/**
* Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
* @type {string}
*/
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgIHhtbDpzcGFjZT0icHJlc2VydmUiIGlkPSJudW1iZXJiYW5rc21hbGwiPgogICAgPCEtLSBHZW5lcmF0ZWQgYnkgUGFpbnRDb2RlIC0gaHR0cDovL3d3dy5wYWludGNvZGVhcHAuY29tIC0tPgogICAgPGcgaWQ9Im51bWJlcmJhbmtzbWFsbC1ncm91cCI+CiAgICAgICAgPGVsbGlwc2UgaWQ9Im51bWJlcmJhbmtzbWFsbC1vdmFsIiBzdHJva2U9Im5vbmUiIGZpbGw9InJnYigxMjgsIDEyOCwgMTI4KSIgY3g9IjIxLjUiIGN5PSI3MiIgcng9IjE1LjUiIHJ5PSIxNiIgLz4KICAgICAgICA8ZWxsaXBzZSBpZD0ibnVtYmVyYmFua3NtYWxsLW92YWwyIiBzdHJva2U9Im5vbmUiIGZpbGw9InJnYigxMjgsIDEyOCwgMTI4KSIgY3g9IjQ3LjI1IiBjeT0iNjEuNSIgcng9IjI2Ljc1IiByeT0iMjYuNSIgLz4KICAgICAgICA8ZWxsaXBzZSBpZD0ibnVtYmVyYmFua3NtYWxsLW92YWwzIiBzdHJva2U9Im5vbmUiIGZpbGw9InJnYigxMjgsIDEyOCwgMTI4KSIgY3g9Ijc2LjI1IiBjeT0iNjEuNSIgcng9IjIxLjc1IiByeT0iMjEuNSIgLz4KICAgIDwvZz4KICAgIDxwYXRoIGlkPSJudW1iZXJiYW5rc21hbGwtdGV4dCIgc3Ryb2tlPSJub25lIiBmaWxsPSJyZ2IoMCwgMCwgMCkiIGQ9Ik0gNDAuMjcsMTcuNyBMIDUzLjQ4LDQ5LjggNTMuNDgsMjcuNiBDIDUzLjQ4LDI0LjI1IDUyLjgzLDIyLjU4IDUxLjUyLDIyLjU4IDUxLjE3LDIyLjU4IDUwLjY2LDIyLjY2IDQ5Ljk5LDIyLjg0IDQ5LjMxLDIzLjAxIDQ4LjgsMjMuMSA0OC40NSwyMy4xIDQ3LjQsMjMuMSA0Ni41MSwyMi42MyA0NS43OSwyMS42OCA0NS4wNiwyMC43MiA0NC43LDE5LjU1IDQ0LjcsMTguMTUgNDQuNywxNi41IDQ1LjE3LDE1LjE4IDQ2LjEyLDE0LjE4IDQ3LjA4LDEzLjE3IDQ4LjMyLDEyLjY4IDQ5Ljg4LDEyLjY4IDUwLjY4LDEyLjY4IDUyLjA1LDEyLjggNTQsMTMuMDUgNTUuOTUsMTMuMyA1Ny42NywxMy40MyA1OS4xNywxMy40MyA2MC41MywxMy40MyA2Mi4xLDEzLjMzIDYzLjksMTMuMTIgNjYuNiwxMi44MiA2OC4yNywxMi42OCA2OC45MiwxMi42OCA3MC41MywxMi42OCA3MS44MiwxMy4xNyA3Mi44MiwxNC4xOCA3My44MywxNS4xOCA3NC4zMywxNi41IDc0LjMzLDE4LjE1IDc0LjMzLDE5LjU1IDczLjkzLDIwLjcyIDczLjEyLDIxLjY4IDcyLjMyLDIyLjYzIDcxLjM1LDIzLjEgNzAuMiwyMy4xIDY5Ljc1LDIzLjEgNjkuMTUsMjMuMDEgNjguNCwyMi44NCA2Ny42NSwyMi42NiA2Ny4wOCwyMi41OCA2Ni42NywyMi41OCA2NS42NywyMi41OCA2NS4wMywyMy4yIDY0LjcyLDI0LjQ1IDY0LjYyLDI0Ljk1IDY0LjU4LDI2IDY0LjU3LDI3LjYgTCA2NC41Nyw1OC4xMiBDIDY0LjU4LDYxLjQzIDYzLjIzLDYzLjA3IDYwLjUyLDYzLjA3IDYwLjAyLDYzLjA3IDU5LjI2LDYzLjA0IDU4LjI0LDYyLjk2IDU3LjIxLDYyLjg5IDU2LjQ1LDYyLjg1IDU1Ljk1LDYyLjg1IDU1LjksNjIuODUgNTQuNjgsNjIuOSA1Mi4yNyw2MyA1Mi4yNyw2MyA1MS43Myw2MyA1MC42Miw2MyA0OS4xNyw2MyA0OC4xLDYyLjY1IDQ3LjQsNjEuOTUgNDcsNjEuNTUgNDYuNDMsNjAuNDggNDUuNjcsNTguNzIgTCAzMS4yLDI1LjcyIDMxLjIsNDguMzggQyAzMS4yLDUxLjc4IDMxLjg1LDUzLjQ3IDMzLjE1LDUzLjQ3IDMzLjUsNTMuNDcgMzQuMDQsNTMuMzkgMzQuNzYsNTMuMjEgMzUuNDksNTMuMDQgMzYuMDIsNTIuOTUgMzYuMzgsNTIuOTUgMzcuNDMsNTIuOTUgMzguMzEsNTMuNDIgMzkuMDQsNTQuMzggMzkuNzYsNTUuMzMgNDAuMTIsNTYuNSA0MC4xMiw1Ny45IDQwLjEyLDYxLjU1IDM4LjM4LDYzLjM4IDM0Ljg4LDYzLjM4IDMzLjg3LDYzLjM4IDMyLjIzLDYzLjIzIDI5LjkzLDYyLjkzIDI4LjM3LDYyLjcyIDI2LjgzLDYyLjYyIDI1LjI3LDYyLjYyIDIzLjk3LDYyLjYyIDIyLjIzLDYyLjc1IDIwLjAyLDYzIDE3LjgyLDYzLjI1IDE2LjQzLDYzLjM4IDE1LjgyLDYzLjM4IDEyLjE3LDYzLjM4IDEwLjM1LDYxLjU1IDEwLjM1LDU3LjkgMTAuMzUsNTYuNSAxMC43NCw1NS4zMyAxMS41MSw1NC4zOCAxMi4yOSw1My40MiAxMy4yNSw1Mi45NSAxNC40LDUyLjk1IDE0Ljg1LDUyLjk1IDE1LjQ2LDUzLjA0IDE2LjI0LDUzLjIxIDE3LjAxLDUzLjM5IDE3LjYsNTMuNDcgMTgsNTMuNDcgMTkuMzUsNTMuNDcgMjAuMDIsNTEuNzggMjAuMDIsNDguMzggTCAyMC4wMiwyNy42IEMgMjAuMDIsMjQuMjUgMTkuMzUsMjIuNTggMTgsMjIuNTggMTcuNiwyMi41OCAxNy4wMSwyMi42NiAxNi4yNCwyMi44NCAxNS40NiwyMy4wMSAxNC44NSwyMy4xIDE0LjQsMjMuMSAxMy4yNSwyMy4xIDEyLjI5LDIyLjYzIDExLjUxLDIxLjY4IDEwLjc0LDIwLjcyIDEwLjM1LDE5LjU1IDEwLjM1LDE4LjE1IDEwLjM1LDE2LjUgMTAuODUsMTUuMTggMTEuODUsMTQuMTggMTIuODUsMTMuMTcgMTQuMTUsMTIuNjggMTUuNzUsMTIuNjggMTYuOCwxMi42OCAxOC4zMiwxMi44IDIwLjMyLDEzLjA1IDIyLjMzLDEzLjMgMjMuOSwxMy40MyAyNS4wNSwxMy40MyAyNiwxMy40MyAyNy42MiwxMy4zMyAyOS45MywxMy4xMiAzMC45OCwxMy4wNyAzMi4xNywxMi45OCAzMy41MiwxMi44MyAzNC4xMywxMi43MiAzNC43NywxMi42OCAzNS40NywxMi42OCAzNi44MywxMi42OCAzNy44NywxMy4yIDM4LjYyLDE0LjI1IDM4LjkzLDE0LjY1IDM5LjQ3LDE1LjggNDAuMjcsMTcuNyBaIE0gNDAuMjcsMTcuNyIgLz4KPC9zdmc+Cg=='

/**
* Icon svg to be displayed in the category menu, encoded as a data URI.
* @type {string}
*/
// eslint-disable-next-line max-len
const menuIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgIHhtbDpzcGFjZT0icHJlc2VydmUiIGlkPSJudW1iZXJiYW5rc21hbGwiPgogICAgPCEtLSBHZW5lcmF0ZWQgYnkgUGFpbnRDb2RlIC0gaHR0cDovL3d3dy5wYWludGNvZGVhcHAuY29tIC0tPgogICAgPGcgaWQ9Im51bWJlcmJhbmtzbWFsbC1ncm91cCI+CiAgICAgICAgPGVsbGlwc2UgaWQ9Im51bWJlcmJhbmtzbWFsbC1vdmFsIiBzdHJva2U9Im5vbmUiIGZpbGw9InJnYigxMjgsIDEyOCwgMTI4KSIgY3g9IjIxLjUiIGN5PSI3MiIgcng9IjE1LjUiIHJ5PSIxNiIgLz4KICAgICAgICA8ZWxsaXBzZSBpZD0ibnVtYmVyYmFua3NtYWxsLW92YWwyIiBzdHJva2U9Im5vbmUiIGZpbGw9InJnYigxMjgsIDEyOCwgMTI4KSIgY3g9IjQ3LjI1IiBjeT0iNjEuNSIgcng9IjI2Ljc1IiByeT0iMjYuNSIgLz4KICAgICAgICA8ZWxsaXBzZSBpZD0ibnVtYmVyYmFua3NtYWxsLW92YWwzIiBzdHJva2U9Im5vbmUiIGZpbGw9InJnYigxMjgsIDEyOCwgMTI4KSIgY3g9Ijc2LjI1IiBjeT0iNjEuNSIgcng9IjIxLjc1IiByeT0iMjEuNSIgLz4KICAgIDwvZz4KICAgIDxwYXRoIGlkPSJudW1iZXJiYW5rc21hbGwtdGV4dCIgc3Ryb2tlPSJub25lIiBmaWxsPSJyZ2IoMCwgMCwgMCkiIGQ9Ik0gNDAuMjcsMTcuNyBMIDUzLjQ4LDQ5LjggNTMuNDgsMjcuNiBDIDUzLjQ4LDI0LjI1IDUyLjgzLDIyLjU4IDUxLjUyLDIyLjU4IDUxLjE3LDIyLjU4IDUwLjY2LDIyLjY2IDQ5Ljk5LDIyLjg0IDQ5LjMxLDIzLjAxIDQ4LjgsMjMuMSA0OC40NSwyMy4xIDQ3LjQsMjMuMSA0Ni41MSwyMi42MyA0NS43OSwyMS42OCA0NS4wNiwyMC43MiA0NC43LDE5LjU1IDQ0LjcsMTguMTUgNDQuNywxNi41IDQ1LjE3LDE1LjE4IDQ2LjEyLDE0LjE4IDQ3LjA4LDEzLjE3IDQ4LjMyLDEyLjY4IDQ5Ljg4LDEyLjY4IDUwLjY4LDEyLjY4IDUyLjA1LDEyLjggNTQsMTMuMDUgNTUuOTUsMTMuMyA1Ny42NywxMy40MyA1OS4xNywxMy40MyA2MC41MywxMy40MyA2Mi4xLDEzLjMzIDYzLjksMTMuMTIgNjYuNiwxMi44MiA2OC4yNywxMi42OCA2OC45MiwxMi42OCA3MC41MywxMi42OCA3MS44MiwxMy4xNyA3Mi44MiwxNC4xOCA3My44MywxNS4xOCA3NC4zMywxNi41IDc0LjMzLDE4LjE1IDc0LjMzLDE5LjU1IDczLjkzLDIwLjcyIDczLjEyLDIxLjY4IDcyLjMyLDIyLjYzIDcxLjM1LDIzLjEgNzAuMiwyMy4xIDY5Ljc1LDIzLjEgNjkuMTUsMjMuMDEgNjguNCwyMi44NCA2Ny42NSwyMi42NiA2Ny4wOCwyMi41OCA2Ni42NywyMi41OCA2NS42NywyMi41OCA2NS4wMywyMy4yIDY0LjcyLDI0LjQ1IDY0LjYyLDI0Ljk1IDY0LjU4LDI2IDY0LjU3LDI3LjYgTCA2NC41Nyw1OC4xMiBDIDY0LjU4LDYxLjQzIDYzLjIzLDYzLjA3IDYwLjUyLDYzLjA3IDYwLjAyLDYzLjA3IDU5LjI2LDYzLjA0IDU4LjI0LDYyLjk2IDU3LjIxLDYyLjg5IDU2LjQ1LDYyLjg1IDU1Ljk1LDYyLjg1IDU1LjksNjIuODUgNTQuNjgsNjIuOSA1Mi4yNyw2MyA1Mi4yNyw2MyA1MS43Myw2MyA1MC42Miw2MyA0OS4xNyw2MyA0OC4xLDYyLjY1IDQ3LjQsNjEuOTUgNDcsNjEuNTUgNDYuNDMsNjAuNDggNDUuNjcsNTguNzIgTCAzMS4yLDI1LjcyIDMxLjIsNDguMzggQyAzMS4yLDUxLjc4IDMxLjg1LDUzLjQ3IDMzLjE1LDUzLjQ3IDMzLjUsNTMuNDcgMzQuMDQsNTMuMzkgMzQuNzYsNTMuMjEgMzUuNDksNTMuMDQgMzYuMDIsNTIuOTUgMzYuMzgsNTIuOTUgMzcuNDMsNTIuOTUgMzguMzEsNTMuNDIgMzkuMDQsNTQuMzggMzkuNzYsNTUuMzMgNDAuMTIsNTYuNSA0MC4xMiw1Ny45IDQwLjEyLDYxLjU1IDM4LjM4LDYzLjM4IDM0Ljg4LDYzLjM4IDMzLjg3LDYzLjM4IDMyLjIzLDYzLjIzIDI5LjkzLDYyLjkzIDI4LjM3LDYyLjcyIDI2LjgzLDYyLjYyIDI1LjI3LDYyLjYyIDIzLjk3LDYyLjYyIDIyLjIzLDYyLjc1IDIwLjAyLDYzIDE3LjgyLDYzLjI1IDE2LjQzLDYzLjM4IDE1LjgyLDYzLjM4IDEyLjE3LDYzLjM4IDEwLjM1LDYxLjU1IDEwLjM1LDU3LjkgMTAuMzUsNTYuNSAxMC43NCw1NS4zMyAxMS41MSw1NC4zOCAxMi4yOSw1My40MiAxMy4yNSw1Mi45NSAxNC40LDUyLjk1IDE0Ljg1LDUyLjk1IDE1LjQ2LDUzLjA0IDE2LjI0LDUzLjIxIDE3LjAxLDUzLjM5IDE3LjYsNTMuNDcgMTgsNTMuNDcgMTkuMzUsNTMuNDcgMjAuMDIsNTEuNzggMjAuMDIsNDguMzggTCAyMC4wMiwyNy42IEMgMjAuMDIsMjQuMjUgMTkuMzUsMjIuNTggMTgsMjIuNTggMTcuNiwyMi41OCAxNy4wMSwyMi42NiAxNi4yNCwyMi44NCAxNS40NiwyMy4wMSAxNC44NSwyMy4xIDE0LjQsMjMuMSAxMy4yNSwyMy4xIDEyLjI5LDIyLjYzIDExLjUxLDIxLjY4IDEwLjc0LDIwLjcyIDEwLjM1LDE5LjU1IDEwLjM1LDE4LjE1IDEwLjM1LDE2LjUgMTAuODUsMTUuMTggMTEuODUsMTQuMTggMTIuODUsMTMuMTcgMTQuMTUsMTIuNjggMTUuNzUsMTIuNjggMTYuOCwxMi42OCAxOC4zMiwxMi44IDIwLjMyLDEzLjA1IDIyLjMzLDEzLjMgMjMuOSwxMy40MyAyNS4wNSwxMy40MyAyNiwxMy40MyAyNy42MiwxMy4zMyAyOS45MywxMy4xMiAzMC45OCwxMy4wNyAzMi4xNywxMi45OCAzMy41MiwxMi44MyAzNC4xMywxMi43MiAzNC43NywxMi42OCAzNS40NywxMi42OCAzNi44MywxMi42OCAzNy44NywxMy4yIDM4LjYyLDE0LjI1IDM4LjkzLDE0LjY1IDM5LjQ3LDE1LjggNDAuMjcsMTcuNyBaIE0gNDAuMjcsMTcuNyIgLz4KPC9zdmc+Cg=='







function sleep(msec) {
    return new Promise(resolve =>
        setTimeout(() => {
            resolve();
        }, msec)
    );
}

function ioWaiter(msec) {
    return new Promise((resolve, reject) =>
        setTimeout(() => {
            if (inoutFlag) {
                reject();
            } else {
                resolve();
            }
        }, msec)
    )
        .catch(() => {
            return ioWaiter(msec);
        });
}

function reportNumWaiter(msec) {
    return new Promise((resolve, reject) =>
        setTimeout(() => {
            if (inoutFlag) {
                reject();
            } else {
                resolve(cloudNum);
            }
        }, msec)
    )
        .catch(() => {
            return reportNumWaiter(msec);
        });
}

function availableWaiter(msec) {
    return new Promise((resolve, reject) =>
        setTimeout(() => {
            if (inoutFlag) {
                reject();
            } else {
                resolve(availableFlag);
            }
        }, msec)
    )
        .catch(() => {
            return availableWaiter(msec);
        });
}

function cloudWaiter(msec) {
    return new Promise((resolve, reject) =>
        setTimeout(() => {
            if (inoutFlag_setting) {
                reject();
            } else {
                resolve(cloudFlag);
            }
        }, msec)
    )
        .catch(() => {
            return cloudWaiter(msec);
        });
}



//
function hexString(textStr) {
    const byteArray = new Uint8Array(textStr);
    const hexCodes = [...byteArray].map(value => {
        const hexCode = value.toString(16);
        const paddedHexCode = hexCode.padStart(2, '0');
        return paddedHexCode;
    });
    return hexCodes.join('');
}




// Firebase関連
var fbApp;
var db;


// Variables
let masterKey = '';
let bankName = '';
let bankKey = '';
let cardKey = '';
let uniKey = '';
let cloudNum = '';
let settingNum = '';
let masterSha256 = '';
let bankSha256 = '';
let cardSha256 = '';
let uniSha256 = '';
let inoutFlag = false;
let inoutFlag_setting = false;
let availableFlag = false;
let cloudFlag = false;
let mkbRequest;
let mkbUrl;
const FBaseUrl = 'https://us-central1-masterkey-bank.cloudfunctions.net/';


const interval = {
    MsPut: 1500,
    MsSet: 1000,
    MsGet: 1000,
    MsRep: 1000,
    MsAvl: 100,
}

const firebaseConfig = {
    masterKey: '',
    cloudType: '',
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};

// 格納用予備
const cloudConfig_mkb = {
    masterKey: '',
    cloudType: '',
    apiKey: '',
    authDomain: '',
    databaseURL: "",
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: '',
    Version: '',
    AccessKeyId: '',
    SecretAccessKey: '',
    SessionToken: '',
    Expiration: '',
    cccCheck: '',
};


// mKey格納用
const cloudConfig_mkey = {
    masterKey: '',
    cloudType: '',
    apiKey: '',
    authDomain: '',
    databaseURL: "",
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: '',
    Version: '',
    AccessKeyId: '',
    SecretAccessKey: '',
    SessionToken: '',
    Expiration: '',
    cccCheck: '',
};



// データ暗号化の下処理
/////////////////////////////////
/////////////////////////////////

function en_org(data) {
    return encoder.encode(data);
}

function en_store(data) {
    return firestore.Bytes.fromUint8Array(new Uint8Array(data)).toBase64();
}

function de_get(data) {
    return firestore.Bytes.fromBase64String(data).toUint8Array();
}

function de_disp(data) {
    return deoder_utf8.decode(data);
}

function en_crt(data) {
    return firestore.Bytes.fromUint8Array(data).toBase64();
}

function de_crt(data) {
    return firestore.Bytes.fromBase64String(data).toUint8Array();
}

////////////////////////////////
///////////////////////////////


function crypt_decode(cryptedConfigData, decodedConfigData) {
    if (inoutFlag) { return; }
    inoutFlag = true;

    decodedConfigData.cccCheck = cryptedConfigData.cccCheck;
    const cccCheck = de_crt(cryptedConfigData.cccCheck);

    let ckey;

    switch (cryptedConfigData.cloudType) {
        case 'firestore':
            // console.log('switch to Firebase!');

            crypto.subtle.digest('SHA-256', encoder.encode(masterKey))
                .then((masterStr) => {

                    return crypto.subtle.importKey('raw', masterStr, 'AES-CTR', false, ['encrypt', 'decrypt']);
                })
                .then((encodedKey) => {
                    ckey = encodedKey;

                    // 復号化開始
                    // apiKey
                    return crypto.subtle.decrypt({ name: 'AES-CTR', counter: cccCheck, length: 64 }, ckey, de_get(cryptedConfigData.apiKey));
                })
                .then((decodedData) => {
                    // console.log('decodedConfigData.apiKey:', de_disp(decodedData));
                    decodedConfigData.apiKey = de_disp(decodedData);

                    // authDomain
                    return crypto.subtle.decrypt({ name: 'AES-CTR', counter: cccCheck, length: 64 }, ckey, de_get(cryptedConfigData.authDomain));
                })
                .then((decodedData) => {
                    // console.log('decodedConfigData.authDomain:', de_disp(decodedData));
                    decodedConfigData.authDomain = de_disp(decodedData);

                    // databaseURL
                    return crypto.subtle.decrypt({ name: 'AES-CTR', counter: cccCheck, length: 64 }, ckey, de_get(cryptedConfigData.databaseURL));
                })
                .then((decodedData) => {
                    // console.log('decodedConfigData.databaseURL:', de_disp(decodedData));
                    decodedConfigData.databaseURL = de_disp(decodedData);

                    // projectId
                    return crypto.subtle.decrypt({ name: 'AES-CTR', counter: cccCheck, length: 64 }, ckey, de_get(cryptedConfigData.projectId));
                })
                .then((decodedData) => {
                    // console.log('decodedConfigData.projectId:', de_disp(decodedData));
                    decodedConfigData.projectId = de_disp(decodedData);

                    // storageBucket
                    return crypto.subtle.decrypt({ name: 'AES-CTR', counter: cccCheck, length: 64 }, ckey, de_get(cryptedConfigData.storageBucket));
                })
                .then((decodedData) => {
                    // console.log('decodedConfigData.storageBucket:', de_disp(decodedData));
                    decodedConfigData.storageBucket = de_disp(decodedData);

                    // messagingSenderId
                    return crypto.subtle.decrypt({ name: 'AES-CTR', counter: cccCheck, length: 64 }, ckey, de_get(cryptedConfigData.messagingSenderId));
                })
                .then((decodedData) => {
                    // console.log('decodedConfigData.messagingSenderId:', de_disp(decodedData));
                    decodedConfigData.messagingSenderId = de_disp(decodedData);

                    // appId
                    return crypto.subtle.decrypt({ name: 'AES-CTR', counter: cccCheck, length: 64 }, ckey, de_get(cryptedConfigData.appId));
                })
                .then((decodedData) => {
                    // console.log('decodedConfigData.appId:', de_disp(decodedData));
                    decodedConfigData.appId = de_disp(decodedData);

                    // measurementId
                    return crypto.subtle.decrypt({ name: 'AES-CTR', counter: cccCheck, length: 64 }, ckey, de_get(cryptedConfigData.measurementId));
                })
                .then((decodedData) => {
                    // console.log('decodedConfigData.measurementId:', de_disp(decodedData));
                    decodedConfigData.measurementId = de_disp(decodedData);

                    inoutFlag = false;
                    // console.log('inoutFlag(decode end):', inoutFlag);
                    return decodedConfigData;

                })
                .catch((err) => {
                    console.log('decoding error:', err);
                });

            break;

        case 'dynamo':
            // console.log('switch to Dynamo!');
            inoutFlag = false;

            break;

        default:
            // console.log('switch doesnt work!');
            inoutFlag = false;

            break;
    }


}



/**
 * Scratch 3.0 blocks
 */
class Scratch3Numberbank {



    /**
    * @return {string} - the name of this extension.
    */
    static get EXTENSION_NAME() {
        return 'NumberBank';
    }

    /**
     * @return {string} - the ID of this extension.
     */
    static get EXTENSION_ID() {
        return EXTENSION_ID;
    }

    /**
     * URL to get this extension.
     * @type {string}
     */
    static get extensionURL() {
        return extensionURL;
    }

    /**
     * Set URL to get this extension.
     * The extensionURL will be changed to the URL of the loading server.
     * @param {string} url - URL
     */
    static set extensionURL(url) {
        extensionURL = url;
    }



    /**
     * Construct a set of blocks for NumberBank1.0.
     * @param {Runtime} runtime - the Scratch 3.0 runtime.
     */
    constructor(runtime) {
        /**
         * The Scratch 3.0 runtime.
         * @type {Runtime}
         */
        this.runtime = runtime;

        console.log(extVersion);

        if (runtime.formatMessage) {
            // Replace 'formatMessage' to a formatter which is used in the runtime.
            formatMessage = runtime.formatMessage;
        }
    }



    putNum(args) {

        if (masterSha256 == '') { return; }

        if (args.BANK == '' || args.CARD == '' || args.NUM == '') { return; }

        if (inoutFlag) { return; }
        inoutFlag = true;

        //console.log("putNum...");

        bankKey = bankName = args.BANK;
        cardKey = args.CARD;

        uniKey = bankKey.trim().concat(cardKey.trim());
        //console.log("uniKey: " + uniKey);    

        if (args.NUM != '' && args.NUM != undefined) {
            settingNum = args.NUM;
            //console.log("settingNum: " + settingNum);    
        }

        if (!crypto || !crypto.subtle) {
            throw Error("crypto.subtle is not supported.");
        }

        if (bankKey != '' && bankKey != undefined) {
            //bankKey
            crypto.subtle.digest('SHA-256', encoder.encode(bankKey))
                .then(bankStr => {
                    bankSha256 = hexString(bankStr);
                    //console.log("bankSha256: " + bankSha256);

                    //cardKey
                    return crypto.subtle.digest('SHA-256', encoder.encode(cardKey));
                })
                .then(cardStr => {
                    cardSha256 = hexString(cardStr);
                    //console.log("cardSha256: " + cardSha256);

                    //uniKey
                    return crypto.subtle.digest('SHA-256', encoder.encode(uniKey));
                })
                .then(uniStr => {
                    uniSha256 = hexString(uniStr);
                    //console.log("uniSha256: " + uniSha256);

                    return sleep(1);
                })
                .then(() => {
                    //console.log("masterSha256: " + masterSha256);

                    if (masterSha256 != '' && masterSha256 != undefined) {
                        // console.log("NumberBank put 00");

                        const now = Date.now();
                        setDoc(doc(db, 'card', uniSha256), {
                            number: settingNum,
                            bank_key: bankSha256,
                            card_key: cardSha256,
                            master_key: masterSha256,
                            time_stamp: now
                        })
                            .then(() => {
                                // console.log("NumberBank put 01");
                                return setDoc(doc(db, 'bank', bankSha256), {
                                    bank_name: bankName,
                                    time_stamp: now
                                });
                            })
                            .then(() => {
                                // console.log("NumberBank put 02");
                                inoutFlag = false;
                            })
                            .catch(function (error) {
                                console.error("Error writing document: ", error);
                                inoutFlag = false;
                            });

                    } else {
                        // console.log("No MasterKey!");
                        inoutFlag = false;
                    }

                    // console.log("NumberBank put 03");

                });

        }

        // console.log("NumberBank put ioWaiter");

        return ioWaiter(interval.MsPut);

    }


    setNum(args, util) {

        if (masterSha256 == '') { return; }

        if (args.BANK == '' || args.CARD == '') { return; }

        if (inoutFlag) { return; }
        inoutFlag = true;

        const variable = util.target.lookupOrCreateVariable(null, args.VAL);

        bankKey = bankName = args.BANK;
        cardKey = args.CARD;

        uniKey = bankKey.trim().concat(cardKey.trim());

        if (!crypto || !crypto.subtle) {
            throw Error("crypto.subtle is not supported.");
        }

        if (bankKey != '' && bankKey != undefined) {
            //bankKey
            crypto.subtle.digest('SHA-256', encoder.encode(bankKey))
                .then(bankStr => {
                    bankSha256 = hexString(bankStr);
                    //console.log("bankSha256: " + bankSha256);    

                    //cardKey
                    return crypto.subtle.digest('SHA-256', encoder.encode(cardKey));
                })
                .then(cardStr => {
                    cardSha256 = hexString(cardStr);
                    //console.log("cardSha256: " + cardSha256);

                    //uniKey
                    return crypto.subtle.digest('SHA-256', encoder.encode(uniKey));
                })
                .then(uniStr => {
                    uniSha256 = hexString(uniStr);
                    //console.log("uniSha256: " + uniSha256);

                    return sleep(1);
                })
                .then(() => {
                    //console.log("masterSha256: " + masterSha256);

                    if (masterSha256 != '' && masterSha256 != undefined) {

                        getDoc(doc(db, 'card', uniSha256)).then(function (ckey) {
                            // console.log("NumberBank set 00");

                            if (ckey.exists()) {
                                // console.log("NumberBank set 01");

                                // cardDb.doc(uniSha256).get()
                                getDoc(doc(db, 'card', uniSha256))
                                    .then((doc) => {
                                        // console.log("NumberBank set 02");
                                        let data = doc.data();
                                        variable.value = data.number;
                                    })
                                    .then(() => {
                                        inoutFlag = false;
                                    })
                                    .catch(function (error) {
                                        console.error("Error getting document: ", error);
                                    });

                            } else {
                                // console.log("No Card!");
                                variable.value = '';
                                inoutFlag = false;
                            }

                        }).catch(function (error) {
                            console.log("Error cheking document:", error);
                            inoutFlag = false;
                        });

                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No MasterKey!");
                        inoutFlag = false;
                    }

                    // console.log("NumberBank set 03");

                });

        }

        // console.log("NumberBank set ioWaiter");

        return ioWaiter(interval.MsSet);

    }


    inoutDone() {
        return !inoutFlag;
    }


    getNum(args) {

        cloudNum = '';

        if (masterSha256 == '') { return; }

        if (args.BANK == '' || args.CARD == '') { return; }

        // console.log('args.BANK:', args.BANK);
        // console.log('args.CARD:', args.CARD);

        if (inoutFlag) { return; }
        inoutFlag = true;

        bankKey = bankName = args.BANK;
        cardKey = args.CARD;

        uniKey = bankKey.trim().concat(cardKey.trim());

        if (!crypto || !crypto.subtle) {
            throw Error("crypto.subtle is not supported.");
        }

        if (bankKey != '' && bankKey != undefined) {
            //bankKey
            crypto.subtle.digest('SHA-256', encoder.encode(bankKey))
                .then(bankStr => {
                    bankSha256 = hexString(bankStr);
                    //console.log("bankSha256: " + bankSha256);

                    //cardKey
                    return crypto.subtle.digest('SHA-256', encoder.encode(cardKey));
                })
                .then(cardStr => {
                    cardSha256 = hexString(cardStr);
                    //console.log("cardSha256: " + cardSha256);

                    //uniKey
                    return crypto.subtle.digest('SHA-256', encoder.encode(uniKey));
                })
                .then(uniStr => {
                    uniSha256 = hexString(uniStr);
                    //console.log("uniSha256: " + uniSha256);

                    return sleep(1);
                })
                .then(() => {
                    // console.log("masterSha256: " + masterSha256);

                    if (masterSha256 != '' && masterSha256 != undefined) {

                        getDoc(doc(db, 'card', uniSha256)).then(function (ckey) {
                            // console.log("NumberBank get 00");

                            if (ckey.exists()) {
                                // console.log("NumberBank get 01");

                                getDoc(doc(db, 'card', uniSha256))
                                    .then((doc) => {
                                        // console.log("NumberBank get 02");
                                        let data = doc.data();
                                        cloudNum = data.number;
                                        // console.log('cloudNum:', cloudNum);
                                    })
                                    .then(() => {
                                        // console.log("NumberBank get 03");
                                        inoutFlag = false;
                                    })
                                    .catch(function (error) {
                                        console.error("Error getting document: ", error);
                                    });

                            } else {
                                // console.log("NumberBank get 04");
                                // console.log("No Card!");
                                cloudNum = '';
                                inoutFlag = false;
                            }

                        }).catch(function (error) {
                            console.log("Error cheking document:", error);
                            inoutFlag = false;
                        });

                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No MasterKey!");
                        inoutFlag = false;
                    }

                    // console.log("NumberBank get 05");

                });

        }

        // console.log("NumberBank get ioWaiter");

        return ioWaiter(interval.MsGet);

    }


    repNum(args, util) {
        return cloudNum;
    }


    repCloudNum(args) {

        if (masterSha256 == '') { return; }

        if (args.BANK == '' || args.CARD == '') { return; }

        if (inoutFlag) { return; }
        inoutFlag = true;

        bankKey = bankName = args.BANK;
        cardKey = args.CARD;

        uniKey = bankKey.trim().concat(cardKey.trim());

        if (!crypto || !crypto.subtle) {
            throw Error("crypto.subtle is not supported.");
        }

        if (bankKey != '' && bankKey != undefined) {
            //bankKey
            crypto.subtle.digest('SHA-256', encoder.encode(bankKey))
                .then(bankStr => {
                    bankSha256 = hexString(bankStr);
                    //console.log("bankSha256: " + bankSha256);

                    //cardKey
                    return crypto.subtle.digest('SHA-256', encoder.encode(cardKey));
                })
                .then(cardStr => {
                    cardSha256 = hexString(cardStr);
                    //console.log("cardSha256: " + cardSha256);

                    //uniKey
                    return crypto.subtle.digest('SHA-256', encoder.encode(uniKey));
                })
                .then(uniStr => {
                    uniSha256 = hexString(uniStr);
                    //console.log("uniSha256: " + uniSha256);

                    return sleep(1);
                })
                .then(() => {
                    //console.log("masterSha256: " + masterSha256);

                    if (masterSha256 != '' && masterSha256 != undefined) {

                        getDoc(doc(db, 'card', uniSha256)).then(function (ckey) {
                            // console.log("NumberBank rep 00");

                            if (ckey.exists()) {
                                // console.log("NumberBank rep 01");

                                getDoc(doc(db, 'card', uniSha256))
                                    .then((doc) => {
                                        // console.log("NumberBank rep 02");
                                        let data = doc.data();
                                        cloudNum = data.number;
                                    })
                                    .then(() => {
                                        inoutFlag = false;
                                    })
                                    .catch(function (error) {
                                        console.error("Error getting document: ", error);
                                    });

                            } else {
                                // console.log("No Card!");
                                cloudNum = '';
                                inoutFlag = false;
                            }

                        }).catch(function (error) {
                            console.log("Error cheking document:", error);
                            inoutFlag = false;
                        });

                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No MasterKey!");
                        inoutFlag = false;
                    }

                    // console.log("NumberBank rep 03");

                });

        }

        // console.log("NumberBank rep ioWaiter");

        return reportNumWaiter(interval.MsRep);

    }


    boolAvl(args, util) {

        if (masterSha256 == '') { return; }

        if (args.BANK == '' || args.CARD == '') { return; }

        if (inoutFlag) { return; }
        inoutFlag = true;

        bankKey = bankName = args.BANK;
        cardKey = args.CARD;

        uniKey = bankKey.trim().concat(cardKey.trim());

        if (!crypto || !crypto.subtle) {
            throw Error("crypto.subtle is not supported.");
        }

        if (bankKey != '' && bankKey != undefined) {
            //
            crypto.subtle.digest('SHA-256', encoder.encode(uniKey))
                .then(uniStr => {
                    uniSha256 = hexString(uniStr);
                    // console.log("uniSha256: " + uniSha256);

                    return sleep(1);
                })
                .then(() => {
                    // console.log("masterSha256: " + masterSha256);

                    if (masterSha256 != '' && masterSha256 != undefined) {

                        getDoc(doc(db, 'card', uniSha256)).then(function (ckey) {
                            // console.log("NumberBank avl 00");

                            if (ckey.exists()) {
                                // console.log("NumberBank avl YES");
                                inoutFlag = false;
                                availableFlag = true;
                            } else {
                                // console.log("NumberBank avl NO");
                                inoutFlag = false;
                                availableFlag = false;
                            }

                        }).catch(function (error) {
                            console.log("Error checking document:", error);
                            inoutFlag = false;
                            availableFlag = false;
                        });

                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No MasterKey!");
                        inoutFlag = false;
                        availableFlag = false;
                    }

                    // console.log("NumberBank avl 03");

                })

        }

        // console.log("NumberBank avl ioWaiter");

        return availableWaiter(interval.MsAvl);

    }


    setMaster(args) {
        let masterSetted = '';

        if (args.KEY == '') { return masterSetted; }

        if (inoutFlag_setting) { return masterSetted; }
        inoutFlag_setting = true;
        inoutFlag = true;

        masterSha256 = '';
        masterSetted = args.KEY;

        mkbUrl = FBaseUrl + 'mkeybank/?mkey=' + masterSetted;
        mkbRequest = new Request(mkbUrl, { mode: 'cors' });


        if (!crypto || !crypto.subtle) {
            throw Error("crypto.subtle is not supported.");
        }

        crypto.subtle.digest('SHA-256', encoder.encode(masterSetted))
            .then(masterStr => {
                masterSha256 = hexString(masterStr);

                return fetch(mkbRequest);
            })
            .then(response => {

                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Unexpected responce status ${response.status} or content type');
                }

            }).then((resBody) => {

                cloudConfig_mkey.masterKey = resBody.masterKey;
                cloudConfig_mkey.cloudType = resBody.cloudType;
                cloudConfig_mkey.apiKey = resBody.apiKey;
                cloudConfig_mkey.authDomain = resBody.authDomain;
                cloudConfig_mkey.databaseURL = resBody.databaseURL;
                cloudConfig_mkey.projectId = resBody.projectId;
                cloudConfig_mkey.storageBucket = resBody.storageBucket;
                cloudConfig_mkey.messagingSenderId = resBody.messagingSenderId;
                cloudConfig_mkey.appId = resBody.appId;
                cloudConfig_mkey.measurementId = resBody.measurementId;
                cloudConfig_mkey.cccCheck = resBody.cccCheck;
                interval.MsPut = resBody.intervalMsPut;
                interval.MsSet = resBody.intervalMsSet;
                interval.MsGet = resBody.intervalMsGet;
                interval.MsRep = resBody.intervalMsRep;
                interval.MsAvl = resBody.intervalMsAvl;


                inoutFlag = false;
                crypt_decode(cloudConfig_mkey, firebaseConfig);
                return ioWaiter(1);

            }).then(() => {
                inoutFlag = true;

                // Initialize Firebase

                if (cloudFlag) {

                    deleteApp(fbApp)
                        .then(() => {
                            cloudFlag = false;
                            fbApp = initializeApp(firebaseConfig);
                            db = getFirestore(fbApp);
                            inoutFlag = false;
                        })
                        .catch((err) => {
                            console.log('Err deleting app:', err);
                            inoutFlag = false;
                        })

                } else {

                    fbApp = initializeApp(firebaseConfig);
                    db = getFirestore(fbApp);
                    inoutFlag = false;

                }

                return ioWaiter(1);

            }).then(() => {

                masterKey = masterSetted;
                cloudFlag = true;
                inoutFlag_setting = false;
                inoutFlag = false;
                console.log("= MasterKey:", masterSetted);
                console.log('= Interval:', interval);
                console.log("= MasterKey Accepted! =");

            })
            .catch(function (error) {

                inoutFlag_setting = false;
                inoutFlag = false;
                console.log("Error setting MasterKey:", error);

            });


        return cloudWaiter(1).then(() => { return masterKey; });

    }




    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        this.setupTranslations();

        return {
            id: 'numberbank',
            name: 'NumberBank',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            showStatusButton: false,
            blocks: [
                {
                    opcode: 'putNum',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'numberbank.putNum',
                        default: 'put[NUM]to[CARD]of[BANK]',
                        description: 'put number to Firebase'
                    }),
                    arguments: {
                        BANK: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.bank',
                                default: 'bank'
                            })
                        },
                        CARD: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.card',
                                default: 'card'
                            })
                        },
                        NUM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '10'
                        }
                    }
                },
                '---',
                {
                    opcode: 'setNum',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'numberbank.setNum',
                        default: 'set [VAL] to number of[CARD]of[BANK]',
                        description: 'set number by Firebase'
                    }),
                    arguments: {
                        BANK: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.bank',
                                default: 'bank'
                            })
                        },
                        CARD: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.card',
                                default: 'card'
                            })
                        },
                        VAL: {
                            type: ArgumentType.STRING,
                            fieldName: 'VARIABLE',
                            variableType: Variable.SCALAR_TYPE,
                            menu: 'valMenu'
                        }
                    }
                },
                '---',
                {
                    opcode: 'getNum',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'numberbank.getNum',
                        default: 'get number of[CARD]of[BANK]',
                        description: 'get number from Firebase'
                    }),
                    arguments: {
                        BANK: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.bank',
                                default: 'bank'
                            })
                        },
                        CARD: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.card',
                                default: 'card'
                            })
                        }
                    }
                },
                {
                    opcode: 'repNum',
                    text: formatMessage({
                        id: 'numberbank.repNum',
                        default: 'cloud number',
                        description: 'report Number'
                    }),
                    blockType: BlockType.REPORTER
                },
                '---',
                {
                    opcode: 'repCloudNum',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'numberbank.repCloudNum',
                        default: 'number of[CARD]of[BANK]',
                        description: 'report Cloud number'
                    }),
                    arguments: {
                        BANK: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.bank',
                                default: 'bank'
                            })
                        },
                        CARD: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.card',
                                default: 'card'
                            })
                        }
                    }
                },
                '---',
                {
                    opcode: 'boolAvl',
                    blockType: BlockType.BOOLEAN,
                    text: formatMessage({
                        id: 'numberbank.boolAvl',
                        default: '[CARD]of[BANK] available?',
                        description: 'report Number'
                    }),
                    arguments: {
                        BANK: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.bank',
                                default: 'bank'
                            })
                        },
                        CARD: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.card',
                                default: 'card'
                            })
                        }
                    }
                },
                '---',
                {
                    opcode: 'setMaster',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'numberbank.setMaster',
                        default: 'set Master[KEY]',
                        description: 'readFirebase'
                    }),
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.key',
                                default: 'key'
                            })
                        }
                    }

                }
            ],
            menus: {
                valMenu: {
                    acceptReporters: true,
                    items: 'getDynamicMenuItems'
                }
            }
        };
    }


    getDynamicMenuItems() {
        return this.runtime.getEditingTarget().getAllVariableNamesInScopeByType(Variable.SCALAR_TYPE);
    }



    setupTranslations() {
        const localeSetup = formatMessage.setup();
        const extensionTranslations = {
            'ja': {
                'numberbank.NumberBank': 'ナンバーバンク',
                'numberbank.argments.bank': 'バンク',
                'numberbank.argments.card': 'カード',
                'numberbank.argments.key': 'key',
                'numberbank.putNum': '[BANK]の[CARD]の数字を[NUM]にする',
                'numberbank.setNum': '[VAL]を[BANK]の[CARD]の数字にする',
                'numberbank.inoutDone': '読み書き完了',
                'numberbank.getNum': '[BANK]の[CARD]を読む',
                'numberbank.repNum': 'クラウド数字',
                'numberbank.repCloudNum': '[BANK]の[CARD]の数字',
                'numberbank.boolAvl': '[BANK]の[CARD]がある',
                'numberbank.setMaster': 'マスター[KEY]をセット'
            },
            'ja-Hira': {
                'numberbank.NumberBank': 'なんばーばんく',
                'numberbank.argments.bank': 'ばんく',
                'numberbank.argments.card': 'かーど',
                'numberbank.argments.key': 'key',
                'numberbank.putNum': '[BANK]の[CARD]のすうじを[NUM]にする',
                'numberbank.setNum': '[VAL]を[BANK]の[CARD]のすうじにする',
                'numberbank.inoutDone': 'よみかきかんりょう',
                'numberbank.getNum': '[BANK]の[CARD]をよむ',
                'numberbank.repNum': 'クラウドすうじ',
                'numberbank.repCloudNum': '[BANK]の[CARD]のすうじ',
                'numberbank.boolAvl': '[BANK]の[CARD]がある',
                'numberbank.setMaster': 'ますたー[KEY]をセット'
            }
        };

        for (const locale in extensionTranslations) {
            if (!localeSetup.translations[locale]) {
                localeSetup.translations[locale] = {};
            }
            Object.assign(localeSetup.translations[locale], extensionTranslations[locale]);
        }
    }


}

exports.blockClass = Scratch3Numberbank;
module.exports = Scratch3Numberbank;