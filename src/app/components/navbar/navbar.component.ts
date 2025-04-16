import { Component, HostListener, OnInit, Renderer2, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { CallBackComponent } from 'src/app/modals/call-back/call-back.component';
import { SigninComponent } from '../../modals/signin/signin.component';
import { SignupComponent } from '../../modals/signup/signup.component';
import { ApiService } from '../../services/api.service';
import { EventService, Events } from '../../services/event.service';
import { UtilService } from '../../services/util.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgbDropdownModule, RouterModule],
  providers: [DatePipe]
})
export class NavbarComponent implements OnInit {
  menu_icon_variable: boolean = false;

  menuVariable: boolean = false;
  menuListVariablee: boolean = false;
  isSideMenuOpen: boolean = false;
  holidayMood: any = [];
  search: string = '';
  searchData: any = [];
  searchIcoon = true
  trending_dest: any;
  trending_INT: any;
  selectedRegionsNames: string = '';
  destinations = [
    {name: 'International'},
    {name: 'Domestic'},
  ]
  placesArray:any = [];
  placesInArray:any = []
  // selectedRegionsNames: string;
  asiaObjects: any;
  selectedObjects: any;
  selectedCountries: any;
  selectedRegionsDomestic: any;
  selectedDomesticDest: any;
  transformedDestinations: any;
  international = true
  transformedHomeData: any;
  destination: string = '';
  openMenu() {

    this.menuVariable = !this.menuVariable;

    this.menu_icon_variable = !this.menu_icon_variable;
    this.isSideMenuOpen = !this.isSideMenuOpen;
  this.preventBodyScroll(this.isSideMenuOpen);

  }
  preventBodyScroll(prevent: boolean) {
    const body = document.body;
  
    if (prevent) {
      this.renderer.setStyle(body, 'overflow-y', 'hidden');
    } else {
      this.renderer.removeStyle(body, 'overflow-y');
    }
  }
  openPackage(value: any) {
    if (value.type == 'place') {
      this.openPlace(value.id);
    }
    else if (value.type == 'theme') {
      this.openTheme(value.id)
    }
  }
  openPlace(place_id: number) {
    // this.router.navigateByUrl("/destination/place/" + place_id);
    this.getPlaceDetail(place_id)
  }
  getPlaceDetail(place_id: number) {
    this.apiService.getAPI(this.apiService.API_BASE_URL + 'places/getPlaceById/' + place_id).then((result) => {
      if (result.status) {
        if (result.result.status == 1) {
          this.router.navigateByUrl("/destination/" + result.result.uuid)
          .then(() => {
            window.location.reload();
          });
        }
      } else {
        alert("Place not found")
      }
    })
  }
  onsearch() {
    this.apiService.getAPI(this.apiService.API_BASE_URL + 'package/searchPackage/' + this.search).then((result) => {
      try {
        console.log(result.result);
        this.searchData = result.result;
      } catch (error) {
        console.log(error)
      }
    })
  }
  themeList = false;
  themeListHeader = false
  destinationList = false;
  destinationListMobHeader = false
  dropDown = false
  openthemes() {
    this.themeListHeader = !this.themeListHeader;
}

closeThemes() {
    setTimeout(() => {
        if (!this.dropDown) {
            this.themeListHeader = false;
        }
    }, 200);
}

closeThemess() {
    setTimeout(() => {
        if (!this.dropDown) {
            this.themeListHeader = false;
        }
    }, 100);
}

mouseEnterDropdown() {
    this.dropDown = true;
    this.themeListHeader = true;
}

mouseLeaveDropdown() {
    this.dropDown = false;
    this.closeThemes();
}

destinationListHeader = false
dropDownDes = false
openDestination(place_id: number) {
  this.apiService.getAPI(this.apiService.API_BASE_URL + 'places/getPlaceById/' + place_id).then((result:any) => {
    if (result.status) {
      if (result.result.status == 1) {
        this.router.navigateByUrl("/destination/" + result.result.uuid)
        .then(() => {
          window.location.reload();
        });
      }
    } else {
      alert("Place not found")
    }
  })
}
openDestinations() {
  this.destinationListHeader = !this.destinationListHeader;
}

closeDestinations() {
  setTimeout(() => {
      if (!this.dropDownDes) {
          this.destinationListHeader = false;
      }
  }, 200);
}

closeDestinationss() {
  setTimeout(() => {
      if (!this.dropDownDes) {
          this.destinationListHeader = false;
      }
  }, 100);
}

domestic(){
    this.international = !this.international
}
internationall(){
  this.international = !this.international
}

mouseEnterDestination() {
  this.dropDownDes = true;
  this.destinationListHeader = true;
}

mouseLeaveDestination() {
  this.dropDownDes = false;
  this.closeDestinations();
}
  showTheme(){
    this.themeList = true;
  }
  showwThemee(){
    this.themeList = false;
  }
  showDestination(){
    this.destinationList = true;
  }
  showDestinationn(){
    this.destinationList = false;
  }
  openMenuu(){
    this.menuListVariablee = this.menuListVariablee;
    this.menu_icon_variable = this.menu_icon_variable;
    this.menu_icon_variable = false;
    this.menuVariable = false;
  }
  tabWidth = window.innerWidth;
  constructor(
    public router: Router,
    public apiService: ApiService,
    private modalService: NgbModal,
    public utilService: UtilService,
    private activatedRoute: ActivatedRoute,
    private eventService: EventService,
    private renderer: Renderer2, private el: ElementRef
  ) { 
    this.activatedRoute.paramMap.subscribe(paramMap => {
      this.destination = paramMap.get('place') || '';
    });
   }
  isHomePage() {
    if (this.router.url == '/holyday-mood' || this.router.url == '/package-detail') {
      return true;
    } else {
      return false;
    }
  }
  // isMobile: boolean;
  // @HostListener('document:mouseenter', ['$event'])
  // onMouseEnter(event: MouseEvent) {
  //   // this.preventBodyScroll(true);
  //   if (this.isMobile) {
  //     this.preventBodyScroll(true);
  //   }
  // }

  // @HostListener('document:mouseleave', ['$event'])
  // onMouseLeave(event: MouseEvent) {
  //   // this.preventBodyScroll(false);
  //   if (this.isMobile) {
  //     this.preventBodyScroll(false);
  //   }
  // }

  // preventBodyScroll(prevent: boolean) {
  //   const body = document.body;

  //   if (prevent) {
  //     this.renderer.setStyle(body, 'overflow-y', 'hidden');
  //   } else {
  //     this.renderer.removeStyle(body, 'overflow-y');
  //   }
  // }
  // @HostListener('window:scroll', ['$event'])
  user_profile:any = null;

  // onWindowScroll() {
  //   let element = document.querySelector('#header') as HTMLElement;
  //   if (window.pageYOffset > element.clientHeight) {
  //     element.classList.add('header-scrolled');
  //   } else {
  //     element.classList.remove('header-scrolled');
  //   }
  // }
  showSearch = false
  ngOnInit(): void {
    this.getCMS();
    this.checkUserProfile()

    this.eventService.on(Events.SIGNIN_SIGNUP, ((data:any) => {
      this.checkUserProfile()
    }));
  }
  isHomeRoute(): boolean {
    return this.router.url === '/';
  }
  getCMS(){
    this.apiService.getAPI(this.apiService.API_BASE_URL + "common/getCMS/HOME_CMS").then((result) => {
      // this.homeCMS = result.data.attributes;
      try {
        let data = JSON.parse(atob(result.result.data));
        this.holidayMood = data.holiday_mood;
        if (this.utilService.checkValue(this.holidayMood) && this.holidayMood.length > 0) {
          this.holidayMood.sort((a:any, b:any) => a.rank - b.rank);
        }
        console.log('holidayMood', this.holidayMood)
        data.td_IN[0].selected = true;
        this.trending_dest = data.td_IN;
        console.log(this.trending_dest)

        const transformHomeData = (data:any) => {
          return data.map((item:any) => {
              return {
                  direction: item.direction,
                  places: item.data.map((place:any) => ({
                      place_name: place.title,
                      place_image: place.image,
                      place_id: place.place_id
                  }))
              };
          });
      };
      
      this.transformedHomeData = transformHomeData(this.trending_dest);
      console.log(this.transformedHomeData);

        this.trending_dest.forEach((item:any) => {
          if (item.selected) {
              this.selectedRegionsDomestic = item.direction
          }
      });
      console.log(this.selectedRegionsDomestic)
        this.trending_dest.forEach((item:any) => {
          item.data.forEach((placeData:any) => {
              let placeObj = {
                  place: placeData.title,
                  place_id: placeData.place_id,
                  direction: item.direction
              };
              this.placesInArray.push(placeObj);
          });
      });
      console.log(this.placesInArray)
      this.selectedDomesticDest = this.placesInArray.filter((obj:any) => obj.direction === this.selectedRegionsDomestic);
        for (let item of data.td_INTERNATINAL) {
          item['selected'] = false
        }
        data.td_INTERNATINAL[0].selected = true;
        this.trending_INT = data.td_INTERNATINAL;
        console.log('trend', this.trending_INT)
        this.trending_INT.forEach((item:any) => {
          if (item.selected) {
              this.selectedRegionsNames = item.place
          }
      });

      this.transformedDestinations =  this.trending_INT.map((region:any) => {
        const places = region.data.flatMap((item:any) => [
            { place_name: item.place_1, place_id: item.place_1_id, place_image: item.place_1_image },
            { place_name: item.place_2, place_id: item.place_2_id, place_image: item.place_2_image },
            { place_name: item.place_3, place_id: item.place_3_id, place_image: item.place_3_image }
        ]);
    
        return {
            place: region.place,
            places: places
        };
    });
    
    console.log(this.transformedDestinations);
    

      console.log(this.selectedRegionsNames)

        this.trending_INT.forEach((item:any) => {
          item.data.forEach((placeData:any) => {
              let region = item.place;
              let placeObj = {
                  place: placeData.place_1,
                  place_id: placeData.place_1_id,
                  region: region
              };
              this.placesArray.push(placeObj);
              placeObj = {
                  place: placeData.place_2,
                  place_id: placeData.place_2_id,
                  region: region
              };
              this.placesArray.push(placeObj);
              placeObj = {
                  place: placeData.place_3,
                  place_id: placeData.place_3_id,
                  region: region
              };
              this.placesArray.push(placeObj);
          });
      });
      this.selectedCountries = this.placesArray.filter((obj:any) => obj.region === this.selectedRegionsNames);

      console.log('select', this.placesArray)
      } catch (error) {
        console.log(error)
      }
    })
  }
  endDestination(){
    this.destinationListHeader = false
  }
  endThemes(){
    this.themeListHeader = false
  }
  tabChangeI(value: any) {
    this.selectedRegionsNames = value
    this.selectedCountries = this.placesArray.filter((obj:any) => obj.region === this.selectedRegionsNames);
  }
  tabChange(value: any) {
    this.selectedRegionsDomestic = value
    this.selectedDomesticDest = this.placesInArray.filter((obj:any) => obj.direction === this.selectedRegionsDomestic);
  }
  sortOrders: string[] = ["My Profile", "My Trips"];
  selectedSortOrder:any = "";

  ChangeSortOrder(newSortOrder: string) { 
   this.selectedSortOrder = newSortOrder;
   console.log("profile mili", this.selectedSortOrder)
   if(this.selectedSortOrder == "My Profile"){
    this.router.navigate(["myprofile"])
    .then(() => {
      this.menuVariable = !this.menuVariable;

      this.menu_icon_variable = !this.menu_icon_variable;
    })
    
   }
   if(this.selectedSortOrder == "My Trips"){
    this.router.navigate(["mytrip"])
     .then(() => {
      this.menuVariable = !this.menuVariable;

      this.menu_icon_variable = !this.menu_icon_variable;
    })
   }
  }

  openTheme(theme_id: number) {
    this.getThemeDetail(theme_id)
  }
  openDestinationn(item:any) {
   this.destinationList = false
    console.log(item.place)
    this.router.navigateByUrl("/destination-detail/" + item)
    .then(() => {
      setTimeout(() => {
        this.openMenu()
      }, 300);
   }) 
  }
  openThemeee() {
     this.router.navigateByUrl("/destination-detail/" + 'themes')
     .then(() => {
      window.location.reload();
    }) 
   }
  //  requestCall(){
  //     let modal_ref = this.modalService.open(CallBackComponent, {
  //       backdrop: 'static',
  //       size: '',
  //       keyboard: false,
  //       centered: true
  //     });
  //  }
  getThemeDetail(theme_id:number) {
    this.apiService.getAPI(this.apiService.API_BASE_URL + 'package/getThemeById/' + theme_id).then((result) => {
      if (result.status) {
        if (result.result.status == 1) {
          this.router.navigateByUrl("/theme/" + result.result.uuid)
          .then(() => {
            window.location.reload();
          });
        }
      } else {
        alert("Theme not found")
      }
    })
  }
  checkUserProfile(){
    if (this.utilService.checkValue(this.utilService.getUserProfile())) {
      this.user_profile = this.utilService.getUserProfile();
    }else{
      this.user_profile=null;
    }
  }

  searchIcon(){
    this.searchIcoon = false
  }
  closeSearchIcon(){
    this.searchIcoon = true
    this.searchData.length = 0
    this.search = ''
  }
  openlogin() {
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

  opensignup() {
    const modalRef = this.modalService.open(SignupComponent, {
      backdrop: 'static',
      size: 'custom',
      keyboard: false,
      centered: true
    });
    modalRef.closed.subscribe((result) => {
      console.log('dismissed:-' + JSON.stringify(result));
    })
  }

  openMyProfile() {
    this.router.navigateByUrl("/myprofile");
  }

  requestCall() {
    // Implement callback functionality
    // const modalRef = this.modalService.open(CallBackComponent, {
    //   backdrop: 'static',
    //   size: '',
    //   keyboard: false,
    //   centered: true
    // });
    console.log('Request call clicked');
  }

}
