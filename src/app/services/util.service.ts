import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DatePipe } from '@angular/common';
import moment, { Moment } from 'moment';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  constructor(private apiService: ApiService, private datePipe: DatePipe) {}

  USER_PROFILE = 'USER_PROFILE';
  USER_LOGIN = 'USER_LOGIN';
  PACKAGE_CUSTOMER_DATA = 'PACKAGE_CUSTOMER_DATA';

  private indexValue = new BehaviorSubject<string>('');
  indexValueFromUpdate = this.indexValue.asObservable();
  private filterValue = new BehaviorSubject<string>('');
  filterValueUpdate = this.filterValue.asObservable();
  private filterTwoValue = new BehaviorSubject<string>('');
  filterTwoValueUpdate = this.filterTwoValue.asObservable();
  private filterThreeValue = new BehaviorSubject<string>('');
  filterThreeValueUpdate = this.filterThreeValue.asObservable();

  fetchIndexValue(updatedIndex: any) {
    this.indexValue.next(updatedIndex);
  }
  fetchFilterValue(updatedValue: any) {
    this.filterValue.next(updatedValue);
  }
  fetchFilterTwoValue(updatedValue: any) {
    this.filterTwoValue.next(updatedValue);
  }
  fetchFilterThreeValue(updatedValue: any) {
    this.filterThreeValue.next(updatedValue);
  }
  setItem(key: any, value: any) {
    // window.localStorage.setItem("GS11ADMIN_" + key, value);
    window.localStorage.setItem('THC_' + key, value);
  }

  getItem(key: any) {
    // return window.localStorage.getItem("GS11ADMIN_" + key);
    return window.localStorage.getItem('THC_' + key);
  }

  clearStorage() {
    // return window.localStorage.getItem("GS11ADMIN_" + key);
    return window.localStorage.clear();
  }

  setSessionItem(key: any, value: any) {
    window.sessionStorage.setItem('THC_' + key, value);
  }

  getSessionItem(key: any) {
    return window.sessionStorage.getItem('THC_' + key);
  }

  getUserProfile() {
    if (
      this.getItem(this.USER_PROFILE) != null &&
      this.getItem(this.USER_PROFILE) != undefined &&
      this.getItem(this.USER_PROFILE) != ''
    ) {
      return JSON.parse(this.getItem(this.USER_PROFILE) as any);
    } else {
      return null;
    }
  }

  getUserID() {
    if (
      this.getItem(this.USER_PROFILE) != null &&
      this.getItem(this.USER_PROFILE) != undefined &&
      this.getItem(this.USER_PROFILE) != ''
    ) {
      return JSON.parse(this.getItem(this.USER_PROFILE) as any).id;
    } else {
      return null;
    }
  }

  checkValue(value: any) {
    if (value != null && value != undefined) {
      return true;
    } else {
      return false;
    }
  }

  convertMinutesToHM(mins: any) {
    let hour = mins / 60;
    if (hour > 0) {
      return (
        this.properFormatNumber(parseInt(hour + '')) +
        ' hour ' +
        this.properFormatNumber(mins % 60) +
        ' min'
      );
    } else {
      return this.properFormatNumber(mins % 60) + ' min';
    }
  }

  properFormatNumber(number: number): string {
    let numString = '';
    if (number < 10) {
      numString = '0' + number;
    } else {
      numString = number + '';
    }
    return numString;
  }

  validateEmail(email: any) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return true;
    }
    return false;
  }

  getCDNMultipleResolutions(imageId: any) {
    let str =
      'https://imagedelivery.net/eXm2rwRzRA14esFntmlbXw/' +
      imageId +
      '/w=2160 2160w, ' +
      'https://imagedelivery.net/eXm2rwRzRA14esFntmlbXw/' +
      imageId +
      '/w=1440 1440w, ' +
      'https://imagedelivery.net/eXm2rwRzRA14esFntmlbXw/' +
      imageId +
      '/w=1080 1080w, ' +
      'https://imagedelivery.net/eXm2rwRzRA14esFntmlbXw/' +
      imageId +
      '/w=720 720w, ' +
      'https://imagedelivery.net/eXm2rwRzRA14esFntmlbXw/' +
      imageId +
      '/w=480 480w, ' +
      'https://imagedelivery.net/eXm2rwRzRA14esFntmlbXw/' +
      imageId +
      '/w=360 360w';
    return str;
  }

  getBannerCDNImage(imageId: any) {
    // return 'https://imagedelivery.net/eXm2rwRzRA14esFntmlbXw/' + imageId + '/public';
    return (
      'https://imagedelivery.net/eXm2rwRzRA14esFntmlbXw/' + imageId + '/xl'
    );
  }

  getCDNImage(imageId: any) {
    return (
      'https://imagedelivery.net/eXm2rwRzRA14esFntmlbXw/' + imageId + '/public'
    );
  }

  calculate_age(dateString: any) {
    let today = new Date();
    let birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    let m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  private subject = new Subject<void>();

  sendClickEvent() {
    this.subject.next();
  }

  getClickEvent(): Observable<any> {
    return this.subject.asObservable();
  }

  getDifferenceBetweenTwoDatesInDays(dateStr2: any, dateStr1: any) {
    const date1 = new Date(dateStr2);
    const date2 = new Date(dateStr1);
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    console.log(diffDays + ' days');
    return diffDays;
  }

  getDayDiff(dateStr2: any, dateStr1: any) {
    const date1 = new Date(dateStr2);
    const date2 = new Date(dateStr1);
    const diffTime = date2.getTime() - date1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    console.log(diffDays + ' days');
    return diffDays;
  }

  getAirlineLogo(airline: any) {
    switch (airline) {
      case 'SpiceJet':
        return 'assets/flightlogo/spicejet.png';
      case 'Air India':
        return 'assets/flightlogo/airindia.png';
      case 'Indigo':
        return 'assets/flightlogo/indigo.png';
      case 'Vistara':
        return 'assets/flightlogo/vistara.jpeg';
      case 'GO FIRST':
        return 'assets/flightlogo/gofirst.jpeg';
      default:
        return 'assets/flightlogo/flight_logo.png';
    }
  }

  getAge(dateString: any) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  getDayIncreament(dayStr: any, count: any) {
    let date = new Date(dayStr);
    date.setDate(date.getDate() + count);
    // console.log("day before:",date);

    // if(count<0){
    //   console.log("count:",count);
    //   console.log("date.getDate():",date.getDate());
    //   date.setDate(date.getDate() - Math.abs(count));
    // }else{
    //   date.setDate(date.getDate() + Math.abs(count));
    // }
    // console.log("day after:",date);

    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }

  cleanJSON(s: any) {
    s = s
      .replace(/\\n/g, '\\n')
      .replace(/\\'/g, "\\'")
      .replace(/\\"/g, '\\"')
      .replace(/\\&/g, '\\&')
      .replace(/\\r/g, '\\r')
      .replace(/\\t/g, '\\t')
      .replace(/\\b/g, '\\b')
      .replace(/\\f/g, '\\f');
    s = s.replace(/[\u0000-\u0019]+/g, '');
    return s;
  }

  map_styles = {
    silver: [
      {
        elementType: 'geometry',
        stylers: [{ color: '#f5f5f5' }],
      },
      {
        elementType: 'labels.icon',
        stylers: [{ visibility: 'off' }],
      },
      {
        elementType: 'labels.text.fill',
        stylers: [{ color: '#616161' }],
      },
      {
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#f5f5f5' }],
      },
      {
        featureType: 'administrative.land_parcel',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#bdbdbd' }],
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{ color: '#eeeeee' }],
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#757575' }],
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#e5e5e5' }],
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9e9e9e' }],
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#ffffff' }],
      },
      {
        featureType: 'road.arterial',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#757575' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#dadada' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#616161' }],
      },
      {
        featureType: 'road.local',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9e9e9e' }],
      },
      {
        featureType: 'transit.line',
        elementType: 'geometry',
        stylers: [{ color: '#e5e5e5' }],
      },
      {
        featureType: 'transit.station',
        elementType: 'geometry',
        stylers: [{ color: '#eeeeee' }],
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#c9c9c9' }],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9e9e9e' }],
      },
      {
        featureType: 'poi.business',
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'transit',
        elementType: 'labels.icon',
        stylers: [{ visibility: 'off' }],
      },
    ],
  };

  convertDT(dtstr: any) {
    return (
      dtstr.split('/')[2] +
      '-' +
      this.properFormatNumber(dtstr.split('/')[1]) +
      '-' +
      this.properFormatNumber(dtstr.split('/')[0])
    );
  }

  parseDT(dt: any) {
    let date = new Date(dt);
    return this.datePipe.transform('');
  }

  reloadURL() {
    if (
      this.apiService.BASE_IP.includes('holidayer') ||
      this.apiService.BASE_IP.includes('holidaytribe')
    ) {
      return this.apiService.BASE_IP;
    } else {
      return 'http://localhost:4200';
    }
  }

  getMomentDT = (dt = null) => {
    var d = new Date();
    if (dt != null) {
      d = new Date(dt);
    }
    let zone = moment().format('Z');
    if (zone != '+05:30') {
      d.setMinutes(d.getMinutes() + 330);
    }
    let dtFormat =
      d.getFullYear() +
      '-' +
      this.properFormatNumber(d.getMonth() + 1) +
      '-' +
      this.properFormatNumber(d.getDate()) +
      ' ' +
      this.properFormatNumber(d.getHours()) +
      ':' +
      this.properFormatNumber(d.getMinutes()) +
      ':' +
      this.properFormatNumber(d.getSeconds());
    return dtFormat;
  };

  getDiffInSecs(dateStr1: any, dateStr2: any) {
    const date1 = new Date(dateStr1);
    const date2 = new Date(dateStr2);
    const differenceInMilliseconds = Math.abs(
      date2.getTime() - date1.getTime()
    );
    const differenceInSeconds = differenceInMilliseconds / 1000;
    console.log('Difference in seconds:', differenceInSeconds);
    return differenceInSeconds;
  }

  getDifferenceInMins(dateStr1: any, dateStr2: any) {
    const date1 = new Date(dateStr1);
    const date2 = new Date(dateStr2);
    const differenceInMilliseconds = Math.abs(
      date2.getTime() - date1.getTime()
    );
    const differenceInSeconds = differenceInMilliseconds / 60000;
    console.log('Difference in seconds:', differenceInSeconds);
    return differenceInSeconds;
  }

  transformMinute(value: number): string {
    let hours = Math.floor(value / 60);
    let minutes = Math.floor(value % 60);
    return hours + ' hrs ' + minutes + ' min';
  }

  transformDate(value: string): number {
    return Date.parse(value);
  }
}
