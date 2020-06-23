import { Component, OnInit } from '@angular/core';
import { Users } from "../../models/users";
import { UsersService } from "../../services/users.service"

@Component({
  selector: 'app-password-forgot',
  templateUrl: './password-forgot.component.html',
  styleUrls: ['./password-forgot.component.css']
})
export class PasswordForgotComponent implements OnInit {
 public email : string;

 //public users: Users[] = [];
 public user: Users;
 public newUser: Users;
 public status:string= '';
 public newPassword: string;
 public confirmPassword: string;
 public show: boolean;

  constructor(
    private usersService: UsersService
  ) { }

  ngOnInit(): void {
    this.email = '';
 
   // this.usersService.getUsers().subscribe((users) => (this.users = users));
    this.show = true;


  }
  onSubmit(email:string){
    //console.log(email)

  //  let userFilter = []
    if(this.email === ''){ 
      this.status = ''
    }else{

   this.usersService.getEmail(email).subscribe(
     response => {
       console.log(response)
      this.user = response;

       if(this.user){
         this.status = 'success'
         this.show = false
       }else{
         this.status ='error'
       }

     },
     error => { 
      var errorMessage = <any>error
     if(errorMessage != null){
   
       this.status = 'error'
     }
   })
   
  
/*
if(this.email === ''){ 
    this.status = ''
  }else{
    userFilter = this.users.filter(element =>(element.email === email))
    if (userFilter.length === 1 ){
      this.status = 'success'
    
      this.newUser = userFilter[0]
      this.show = false
    }else{
      this.status = 'error'
    }
*/

     
  }   

  }

  onPassword(){


    this.newUser.password = this.newPassword
    console.log('datos a enviar', this.newUser._id,  this.newUser.password )
    this.usersService.putPassword(this.newUser.password, this.newUser._id).subscribe(
      () => {
          this.status = 'correcto'
      });

  }

}
