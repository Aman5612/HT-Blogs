import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import { ApiService } from '../../services/api.service';
import { EmitEvent, EventService, Events } from '../../services/event.service';
import { UtilService } from '../../services/util.service';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { SignupComponent } from '../signup/signup.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, NgbModalModule]
})
export class SigninComponent implements OnInit {

  phone: any;
  otp: any;
  showOTPInput = false;

  constructor(
    private activeModal: NgbActiveModal,
    private apiService: ApiService,
    private modalService: NgbModal,
    private utilService: UtilService,
    private toaster: HotToastService,
    private eventService:EventService
  ) { }

  ngOnInit(): void {
  }
  closeModal() {
    this.activeModal.close({
      signup: false
    });
  }

  signUp() {
    this.activeModal.close({
    })
    const modalRef = this.modalService.open(SignupComponent, {
      backdrop: 'static',
      size: '',
      keyboard: false,
      centered: true
    });
  }

  userLoginResp:any = null;

  login() {

    if (isNaN(this.phone) && this.phone.toString().length != 10) {
      this.toaster.error("Please enter valid phone number");
      return;
    }

    this.apiService.getAPI(this.apiService.API_BASE_URL + 'user/loginViaOTP/' + this.phone).then((result) => {
      if (result.status) {
        this.userLoginResp = result.result;
        this.showOTPInput = true;


        // this.utilService.setItem(this.utilService.USER_PROFILE, JSON.stringify(result.result));
        // this.utilService.setItem(this.utilService.USER_LOGIN, 1);
        // this.toaster.success("Login Successfull");
        // this.eventService.emit(new EmitEvent(Events.SIGNIN_SIGNUP, ""));
        // this.activeModal.close({
        //   signup: false
        // })
        
      } else {
        this.toaster.error(result.message);
      }
    })
  }

  verifyOTP() {

    if (isNaN(this.phone) && this.phone.toString().length != 4) {
      this.toaster.error("Please enter valid OTP");
      return;
    }

    this.apiService.getAPI(this.apiService.API_BASE_URL + 'user/verifyOTP/' + this.userLoginResp.id + "/" + this.otp).then((result) => {
      if (result.status) {
        this.utilService.setItem(this.utilService.USER_PROFILE, JSON.stringify(result.result));
        this.utilService.setItem(this.utilService.USER_LOGIN, 1);
        this.toaster.success("Login Successfull");
        this.eventService.emit(new EmitEvent(Events.SIGNIN_SIGNUP, ""));
        this.activeModal.close({
          signup: false
        })
      } else {
        this.toaster.error(result.message);
      }
    })
  }

}