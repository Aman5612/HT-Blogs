import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class AESService {
  constructor() {}

  encrypt(plainText: any, key: any) {
    // var key = CryptoJS.enc.Utf8.parse(secret);
    // let iv = CryptoJS.lib.WordArray.create(key.words.slice(0, 4));
    // console.log("IV : " + CryptoJS.enc.Base64.stringify(iv));
    //
    // // Encrypt the plaintext
    // var cipherText = CryptoJS.AES.encrypt(plainText, key, {
    //   iv: iv,
    //   mode: CryptoJS.mode.CBC,
    //   padding: CryptoJS.pad.Pkcs7
    // });
    // return cipherText.toString();
    return CryptoJS.AES.encrypt(plainText, key).toString();
  }

  decrypt(data: any, key: any) {
    // IV is a base64 string
    // let iv1 = CryptoJS.enc.Base64.parse(iv);
    //
    // var key = CryptoJS.enc.Utf8.parse(secret);
    // var cipherBytes = CryptoJS.enc.Base64.parse(cipherText);
    //
    // var decrypted = CryptoJS.AES.decrypt({ciphertext: cipherBytes}, key, {
    //   iv: iv1,
    //   mode: CryptoJS.mode.CBC,
    //   padding: CryptoJS.pad.Pkcs7
    // });
    //
    // return decrypted.toString(CryptoJS.enc.Utf8);
    const bytes = CryptoJS.AES.decrypt(data, key);

    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
