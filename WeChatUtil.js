import React from 'react'
import {Platform,PermissionsAndroid} from 'react-native'
import RNFS from 'react-native-fs'
import * as WeChat from 'react-native-wechat'
import {captureRef} from 'react-native-view-shot'
import {show} from './Utils'
import {getString} from "../base/constants/I18n";

const saveDir = (Platform.OS === 'ios' ? RNFS.DocumentDirectoryPath : RNFS.ExternalStorageDirectoryPath) + '/pgrab/screenshot'
const APP_ID = "wx1ab4df4b8c93adc0"
//const APP_SECRET = "4e1f8dab001f945b8b53a52057004425" //pGrab
const APP_SECRET = "8b5b1c97e596e76d239845843aaec0eb"   //OOZIZ

const isWXAppInstalled = () => {
    return WeChat.isWXAppInstalled()
        .then(isInstalled => isInstalled)
        .catch(error => false)
}

const isAndroidGranted = () => {
    if (Platform.OS === 'ios') {
        return true
    } else {
        return PermissionsAndroid
            .check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
            .then(isGranted => isGranted )
            .catch(error=> false)
    }
}

const mkdirDir = (dir) => {
    return RNFS.exists(dir)
        .then((isExist)=>{
            if (!isExist) {
                return RNFS.mkdir(dir)
                            .then((data)=> true)
                            .catch((error)=> false)
            } else {
                return true
            }
        })
        .catch((error)=> false)
}

const screenShot = (ref) => {
    return captureRef(ref,{
        format: "png",
        quality: 1,
        result: "tmpfile",
        //snapshotContentContainer: true
    }).then(path=> path )
        .catch(error=> "")
}

const moveFile = (path,newPath) => {
    return RNFS.moveFile(path,newPath)
                .then((data)=> true)
                .catch(()=> false)
}


const sharePictureToSession = (path) => {

    const options = {
        type: 'imageFile',
        imageUrl: "file://"+path,
    }

    return WeChat.shareToSession(options)
                .then((data)=> true)
                .catch((error)=> false)
}

const sharePictureToTimeLine = (path) => {

    const options = {
        type: 'imageFile',
        imageUrl: "file://"+path,
    }

    return WeChat
        .shareToTimeline(options)
        .then((data)=> true)
        .catch((error)=> false)
}

export const sharePictureToWx = async (ref,isWeChat,curLanguageIndex) => {

    WeChat.registerApp(APP_ID)

    const isInstallWx = await isWXAppInstalled()
    if (!isInstallWx) {
        show(getString('noWeChat',curLanguageIndex))
        return false;
    }

    const isGranted = await isAndroidGranted()
    if (!isGranted) {
        show(getString('readWritePermission',curLanguageIndex))
        return false;
    }

    const createDirResult = await mkdirDir(saveDir)

    if (!createDirResult) {
        show(getString('mkdirDirFileError',curLanguageIndex))
        return false;
    }

    const path = await screenShot(ref)
    if (path.length == 0) {
        show(getString('screenShotFailure',curLanguageIndex))
        return false;
    }

    const newPath = `${saveDir}/${new Date().getTime()}.png`

    const moveResult = await moveFile(path,newPath)

    if (!moveResult) {
        show(getString('shareError',curLanguageIndex))
        return false;
    }

    if (isWeChat) {
        const result = await sharePictureToSession(newPath)
        return result;
    } else {
        const result = await sharePictureToTimeLine(newPath)
        return result;
    }

}

const getAuthCode = () => {
    const scope = 'snsapi_userinfo';
    const state = 'weChat_pGrab';
    return WeChat.sendAuthRequest(scope,state)
        .then((data)=>{
            if (data.errCode == 0) {
                return {
                    isSuccess: true,
                    code: data.code
                }
            } else {
                return {
                    isSuccess: false
                }
            }
        }).catch((error)=>{
            return {
                isSuccess: false
            }
        })
}

const getAccessToken = (code) => {
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${APP_ID}&secret=${APP_SECRET}&code=${code}&grant_type=authorization_code`
    console.log(''+url)
    const opts = {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    }
    return fetch(url,opts)
        .then(response => response.json())
        .then(data => {
            if (data.openid != null) {
                return {
                    isSuccess: true,
                    data: data
                }
            } else {
                return {
                    isSuccess: false
                }
            }
        })
        .catch(error => {
            return {
                isSuccess: false
            }
        })
}

//微信登录
export const weChatLogin = async (curLanguageIndex) => {

    WeChat.registerApp(APP_ID)

    const isInstallWx = await isWXAppInstalled()
    if (!isInstallWx) {
        show(getString('noWeChat',curLanguageIndex))
        return false;
    }

    const codeResult = await getAuthCode()

    if (!codeResult.isSuccess) {
        show(getString('authError',curLanguageIndex))
        return false;
    }

    const autoResult = await getAccessToken(codeResult.code)

    if (!autoResult.isSuccess) {
        show(getString('authError',curLanguageIndex))
        return false;
    }

    return {
        isSuccess: true,
        data: {
            accessToken: autoResult.data.access_token,
            wechatOpenId: autoResult.data.openid
        }
    }

}

//分享链接
export const shareUrlToWeChat = async (isWeChat,shareData) => {

    WeChat.registerApp(APP_ID)

    if (isWeChat) {
        const result = await WeChat.shareToSession(shareData)
            .then((data)=>{
                if (data.errCode == 0) {
                    return true
                } else {
                    return false
                }
            }).catch((error)=>{
                return false
            })
        return result
    } else {
        const result = await WeChat.shareToTimeline(shareData)
            .then((data)=>{
                if (data.errCode == 0) {
                    return true
                } else {
                    return false
                }
            }).catch((error)=>{
                return false
            })
        return result
    }
}

//是否安装微信
export const installWechat = async () => {

    WeChat.registerApp(APP_ID)

    const isInstallWx = await isWXAppInstalled()

    return isInstallWx

}

//分享纯文字
export const shareTextToWeChat = async (shareData) => {

    WeChat.registerApp(APP_ID)

    const result = await WeChat.shareToSession(shareData)
        .then((data)=>{
            if (data.errCode == 0) {
                return true
            } else {
                return false
            }
        }).catch((error)=>{
            return false
        })
    return result

}