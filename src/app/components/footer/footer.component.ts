import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UtilService } from '../../services/util.service';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  imports: [FormsModule],
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  tabWidth = 1280;

  name = '';
  email = '';
  phone = '';
  destination = '';
  openPopup: boolean = false;
  constructor(
    private utilService: UtilService,
    public router: Router,
    public route: ActivatedRoute,
    private modalService: NgbModal,
    private toast: HotToastService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    console.log(this.tabWidth);
    console.log('urllll', this.router.url);
  }
  // isDestinationUuidRoute(dynamicUuid: string) {
  //   return this.router.url.includes('/destination/' + dynamicUuid);
  // }

  otp = '';
  showOTPInput = false;
  otp_received = '';
  otp_sent_on = null;

  themeList = false;
  showTheme() {
    this.themeList = true;
  }
  showwThemee() {
    this.themeList = false;
  }
  themeListt = false;
  showTerms() {
    this.themeListt = true;
  }
  showwTermss() {
    this.themeListt = false;
  }
  themeListtt = false;
  showAbout(value: any) {
    this.router.navigate(['/', value]);
  }
  showHoliday(value: any) {
    this.router.navigate(['/', value]);
    setTimeout(() => {
      this.utilService.sendClickEvent();
    }, 100);
  }
  showPartner(value: any) {
    this.router.navigate(['/', value]);
  }
  showBlog(value: any) {
    this.router.navigate(['/', value]);
  }
  showwAbout() {
    this.themeListtt = false;
  }
  navigatee(valuee: any) {
    this.router.navigate(['/', valuee]);
  }
  navigateee(valuee: any) {
    this.router.navigate(['/theme', valuee]).then(() => {
      window.location.reload();
    });
  }
  scrollToElement() {
    this.utilService.sendClickEvent();
  }

  submitNewsLetter() {
    if (this.name.trim() == '') {
      this.toast.error('Please enter name');
      return;
    }
    if (this.destination.trim() == '') {
      this.toast.error('Please enter destination');
      return;
    }
    if (this.phone.toString().trim().length != 10) {
      this.toast.error('Please enter valid phone number');
      return;
    }

    this.submitFinalNewsLetter();

    // this.submitFinalNewsLetter()
    // this.sendOTP();
    // this.apiService.postAPI(this.apiService.API_BASE_URL + "common/addNewsLetter", {
    //   "name": this.name,
    //   "phone": this.phone,
    //   "email": this.email
    // }).then((result) => {
    //   // this.homeCMS = result.data.attributes;
    //   if (result.status) {
    //     this.modalService.open(ThankYouComponent, {
    //       backdrop: 'static',
    //       size: '',
    //       keyboard: false,
    //       centered: true
    //     });
    //     // this.toast.success("Thank you for subscribing!");
    //     this.name = ''
    //     this.email = ''
    //     this.phone = ''
    //   } else {
    //     this.toast.error(result.message);
    //   }
    // }, (error) => {
    //   this.toast.error("Something went wrong");
    //   console.log(error);

    // })
  }
  sendOTP() {
    this.apiService
      .getAPI(this.apiService.API_BASE_URL + 'user/queryFormOTP/' + this.phone)
      .then((result) => {
        try {
          this.toast.success('OTP sent to phone');
          this.otp_received = result.result;
          this.otp_sent_on = new Date() as any;
          this.showOTPInput = true;
        } catch (error) {
          console.log(error);
        }
      });
  }
  verifyOTP() {
    console.log(this.otp_received);
    console.log(this.otp);
    console.log(Number(this.otp_received));
    console.log(Number(this.otp));
    console.log(this.otp_sent_on);

    if (Number(this.otp_received) == Number(this.otp)) {
      (this.otp_sent_on as any)?.setMinutes(
        (this.otp_sent_on as any)?.getMinutes() + 10
      );
      if (new Date().getTime() > (this.otp_sent_on as any)?.getTime()) {
        this.toast.error('OTP Expired');
      } else {
        this.submitFinalNewsLetter();
        this.showOTPInput = false;
      }
    } else {
      this.toast.error('Please enter valid otp');
    }
  }

  submitFinalNewsLetter() {
    this.apiService
      .postAPI(this.apiService.API_BASE_URL + 'common/addNewsLetter', {
        name: this.name,
        phone: this.phone,
        destination: this.destination,
      })
      .then(
        (result) => {
          // this.homeCMS = result.data.attributes;
          if (result.status) {
            this.name = '';
            this.phone = '';
            this.destination = '';
            this.showOTPInput = false;
            this.router.navigateByUrl('/thankyou').then(() => {
              window.location.reload();
            });
          } else {
            this.toast.error(result.message);
          }
        },
        (error) => {
          this.toast.error('Something went wrong');
          console.log(error);
        }
      );
  }
}
