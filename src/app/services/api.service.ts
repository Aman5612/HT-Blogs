import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // BASE_IP = 'http://localhost';
  BASE_IP = 'https://webapi.holidaytribe.com';
  // BASE_IP = 'https://www.holidayer.in';
  // BASE_URL: string = 'http://localhost/';
  API_BASE_URL: string = this.BASE_IP + '/';
  // WS_BASE_URL: string = 'localhost:3001';
  API_IMAGE_BASE_URL: string = this.BASE_IP + '/thc_api';
  IMAGE_CMS_BASE_URL: string = this.BASE_IP + '/thc_cms/public';
  CCAVANUE_URL = this.BASE_IP + "/thc_api/ccavanue/pg_request.php";
  CCAVANUE_REDIRECT_URL = this.BASE_IP + "/thc_api/ccavanue/ccavResponseHandler.php";
  CCAVANUE_CANCEL_URL = this.BASE_IP + "/thc_api/ccavanue/ccavResponseHandler.php";


  constructor(
    private http: HttpClient
  ) {
  }

  getAPI(url: string): Promise<any> {
    console.log('url:-' + url);
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe(result => {
        try {
          let parsedJSON = JSON.parse(JSON.stringify(result));
          resolve(parsedJSON);
        } catch (err) {
          reject(err);
        }
      }, error => {
        console.log('API Error', JSON.stringify(error, null, 4));
        error = JSON.parse(JSON.stringify(error));
        reject(error);
      });
    });
  }

  async postAPI(url: string, postData: any): Promise<any> {
    console.log('url:-' + url);
    console.log('postData:-' + JSON.stringify(postData, null, 4));
    return new Promise((resolve, reject) => {
      this.http.post(url, postData).subscribe(result => {

        try {
          // console.log('data:-' + JSON.stringify(result, null, 4));
          var parsedJSON = JSON.parse(JSON.stringify(result));
          resolve(parsedJSON);
        } catch (err) {
          reject(err);
        }
      }, error => {
        console.log('API Error', JSON.stringify(error, null, 4));
        error = JSON.parse(JSON.stringify(error));
        reject(error);
      });
    });
  }
  async putAPI(url: string, postData: any): Promise<any> {
    console.log('url:-' + url);
    console.log('postData:-' + JSON.stringify(postData, null, 4));
    return new Promise((resolve, reject) => {
      this.http.put(url, postData).subscribe(result => {

        try {
          // console.log('data:-' + JSON.stringify(result, null, 4));
          var parsedJSON = JSON.parse(JSON.stringify(result));
          resolve(parsedJSON);
        } catch (err) {
          reject(err);
        }
      }, error => {
        console.log('API Error', JSON.stringify(error, null, 4));
        error = JSON.parse(JSON.stringify(error));
        reject(error);
      });
    });
  }

  async postAPIHeader(url: string, postData: any): Promise<any> {
    console.log('url:-' + url);
    console.log('postData:-' + JSON.stringify(postData, null, 4));

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer x34haqzgfLuX5L_fQuattf2i8f1iwbAeBvWH9mQQ',
      })
    };

    return new Promise((resolve, reject) => {
      this.http.post(url, postData).subscribe(result => {

        try {
          // console.log('data:-' + JSON.stringify(result, null, 4));
          var parsedJSON = JSON.parse(JSON.stringify(result));
          resolve(parsedJSON);
        } catch (err) {
          reject(err);
        }
      }, error => {
        console.log('API Error', JSON.stringify(error, null, 4));
        error = JSON.parse(JSON.stringify(error));
        reject(error);
      });
    });
  }
}
