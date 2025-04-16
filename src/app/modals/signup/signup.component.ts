import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import { ApiService } from '../../services/api.service';
import { EmitEvent, EventService, Events } from '../../services/event.service';
import { UtilService } from '../../services/util.service';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { SigninComponent } from '../signin/signin.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, NgbModalModule]
})
export class SignupComponent implements OnInit {

  first_name = '';
  last_name = '';
  email = '';
  password = '';
  confirm_password = '';
  phone = '';
  otp:any;
  showOTP = false;

  constructor(
    private activeModal: NgbActiveModal,
    private utilService: UtilService,
    private apiService: ApiService,
    private toaster: HotToastService,
    private eventService: EventService,
    private modalService: NgbModal,
  ) {
  }

  ngOnInit(): void {
  }

  closeModal() {
    this.activeModal.close({
    });
    const modalRef = this.modalService.open(SigninComponent, {
      backdrop: 'static',
      size: '',
      keyboard: false,
      centered: true
    });
    modalRef.closed.subscribe((result) => {
      console.log('dismissed:-' + JSON.stringify(result));
    })
  }
  userLoginResp:any = null;
  signUp() {
    if (this.first_name == '') {
      this.toaster.error("Please enter first name");
      return;
    }
    if (this.last_name == '') {
      this.toaster.error("Please enter last name");
      return;
    }
    if (this.email == '') {
      this.toaster.error("Please enter email");
      return;
    }
    if (!this.utilService.validateEmail(this.email)) {
      this.toaster.error("Please enter valid email");
      return;
    }
    if (this.phone.toString().length != 10) {
      this.toaster.error("Please enter valid phone number");
      return;
    }
    // if (this.password.toString().length < 6) {
    //   this.toaster.error("Password must greater than 6 chars");
    //   return;
    // }
    // if (this.password != this.confirm_password) {
    //   this.toaster.error("Password and confirm password do not match");
    //   return;
    // }

    this.apiService.postAPI(this.apiService.API_BASE_URL + 'user/register', {
      first_name: this.first_name,
      last_name: this.last_name,
      email: this.email,
      phone: this.phone,
      // password: this.password
    }).then((result) => {
      if (result.status) {
        this.showOTP = true;
        this.userLoginResp = result.result;
        

        // this.utilService.setItem(this.utilService.USER_PROFILE, JSON.stringify(result.result));
        // this.utilService.setItem(this.utilService.USER_LOGIN, 1);
        // this.toaster.success("Signup Successfull");
        // this.eventService.emit(new EmitEvent(Events.SIGNIN_SIGNUP, ""));
        // this.activeModal.close();

      } else {
        this.toaster.error(result.message);
      }
    })
  }

  verifyOTP() {
    if (isNaN(this.otp) && this.phone.toString().length != 4) {
      this.toaster.error("Please enter valid OTP");
      return;
    }

    this.apiService.getAPI(this.apiService.API_BASE_URL + 'user/verifyOTP/' + this.userLoginResp?.id + "/" + this.otp).then((result) => {
      if (result.status) {
        this.utilService.setItem(this.utilService.USER_PROFILE, JSON.stringify(result.result));
        this.utilService.setItem(this.utilService.USER_LOGIN, "1");
        this.toaster.success("Signup Successfull");
        this.eventService.emit(new EmitEvent(Events.SIGNIN_SIGNUP, ""));
        this.activeModal.close();
      } else {
        this.toaster.error(result.message);
      }
    })
  }

}