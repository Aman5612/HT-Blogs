import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AESService } from './aes.services';


@Injectable({
  providedIn: 'root',
})
export class ApiService {
  KEY = '+1HT2024!t&5u*Z520241102';

  // BASE_IP = 'http://localhost';
  // BASE_IP = 'http://192.168.0.241';
  BASE_IP = 'https://webapi.holidaytribe.com';
  // BASE_IP = 'https://staging.holidaytribe.com';
  // BASE_IP = 'https://www.holidayer.in';
  // BASE_URL: string = 'http://localhost/';
  // API_BASE_URL: string = this.BASE_IP + ':4000/';
  API_BASE_URL: string = this.BASE_IP + '/';
  // API_BASE_URL: string = this.BASE_IP + '/';
  // WS_BASE_URL: string = 'localhost:3001';
  API_IMAGE_BASE_URL: string = this.BASE_IP + '/thc_api_test';
  // API_IMAGE_BASE_URL: string = this.BASE_IP + '/thc_api';
  CCAVANUE_URL = this.BASE_IP + '/thc_api/ccavanue/pg_request.php';
  CCAVANUE_REDIRECT_URL =
    this.BASE_IP + '/thc_api/ccavanue/ccavResponseHandler.php';
  CCAVANUE_REDIRECT_FIXED_URL =
    this.BASE_IP + '/thc_api/ccavanue/ccavFixedResponseHandler.php ';
  CCAVANUE_CANCEL_URL =
    this.BASE_IP + '/thc_api/ccavanue/ccavResponseHandler.php';
  CDN_BASE_URL = 'https://dsge8950r7q4v.cloudfront.net/';

  api_image_url = 'https://dsge8950r7q4v.cloudfront.net/assets/img/';

  API_SQS_URL = 'https://prodleads.holidaytribe.com/common/publishLeadToSqs';

  constructor(private http: HttpClient, private aesService: AESService) {}

  getAPI(url: string): Promise<any> {
    //debug console.log('url:-' + url);
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe(
        (result) => {
          try {
            let parsedJSON = JSON.parse(JSON.stringify(result));
            resolve(parsedJSON);
          } catch (err) {
            reject(err);
          }
        },
        (error) => {
          //debug console.log('API Error', JSON.stringify(error, null, 4));
          error = JSON.parse(JSON.stringify(error));
          reject(error);
        }
      );
    });
  }

  async postAPI(url: string, postData: any): Promise<any> {
    console.log('url:-' + url);
    console.log('postData:-' + JSON.stringify(postData, null, 4));
    let payload_data = this.aesService.encrypt(
      JSON.stringify(postData),
      this.KEY
    );
    let post = {
      payload_data: payload_data,
    };
    if (url.includes('erpquote/createChatBotLead')) {
      post = postData;
    }
    if (url.includes('pg_request.php')) {
      post = postData;
    }
    return new Promise((resolve, reject) => {
      this.http.post(url, post).subscribe(
        (result) => {
          try {
            // //debug console.log('data:-' + JSON.stringify(result, null, 4));
            var parsedJSON = JSON.parse(JSON.stringify(result));
            resolve(parsedJSON);
          } catch (err) {
            reject(err);
          }
        },
        (error) => {
          //debug console.log('API Error', JSON.stringify(error, null, 4));
          error = JSON.parse(JSON.stringify(error));
          reject(error);
        }
      );
    });
  }

  async putAPI(url: string, postData: any): Promise<any> {
    //debug console.log('url:-' + url);
    //debug console.log('postData:-' + JSON.stringify(postData, null, 4));
    let payload_data = this.aesService.encrypt(
      JSON.stringify(postData),
      this.KEY
    );
    let post = {
      payload_data: payload_data,
    };
    return new Promise((resolve, reject) => {
      this.http.put(url, post).subscribe(
        (result) => {
          try {
            // //debug console.log('data:-' + JSON.stringify(result, null, 4));
            var parsedJSON = JSON.parse(JSON.stringify(result));
            resolve(parsedJSON);
          } catch (err) {
            reject(err);
          }
        },
        (error) => {
          //debug console.log('API Error', JSON.stringify(error, null, 4));
          error = JSON.parse(JSON.stringify(error));
          reject(error);
        }
      );
    });
  }

  async postAPIHeader(url: string, postData: any): Promise<any> {
    //debug console.log('url:-' + url);
    //debug console.log('postData:-' + JSON.stringify(postData, null, 4));

    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: 'Bearer x34haqzgfLuX5L_fQuattf2i8f1iwbAeBvWH9mQQ',
      }),
    };

    return new Promise((resolve, reject) => {
      this.http.post(url, postData).subscribe(
        (result) => {
          try {
            // //debug console.log('data:-' + JSON.stringify(result, null, 4));
            var parsedJSON = JSON.parse(JSON.stringify(result));
            resolve(parsedJSON);
          } catch (err) {
            reject(err);
          }
        },
        (error) => {
          //debug console.log('API Error', JSON.stringify(error, null, 4));
          error = JSON.parse(JSON.stringify(error));
          reject(error);
        }
      );
    });
  }
}
