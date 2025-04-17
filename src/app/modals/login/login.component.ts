import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UtilService } from '../../services/util.service';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [FormsModule],
  standalone: true,
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';

  constructor(
    private activeModal: NgbActiveModal,
    private utilService: UtilService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {}

  closeModal() {
    this.activeModal.close({
      signup: false,
    });
  }

  signUp() {
    this.activeModal.close({
      signup: true,
    });
  }

  login() {
    if (this.email == '') {
      alert('Please enter email');
      return;
    }
    // if (!this.utilService.validateEmail(this.email)) {
    //   alert("Please enter valid email");
    //   return;
    // }
    if (this.password.toString().length == 0) {
      alert('Please enter password');
      return;
    }

    this.apiService
      .postAPI(this.apiService.API_BASE_URL + 'user/login', {
        email: this.email,
        password: this.password,
      })
      .then((result) => {
        if (result.status) {
          this.utilService.setItem(
            this.utilService.USER_PROFILE,
            JSON.stringify(result.result)
          );
          this.activeModal.close({
            signup: false,
          });
        } else {
          alert(result.message);
        }
      });
  }
}
