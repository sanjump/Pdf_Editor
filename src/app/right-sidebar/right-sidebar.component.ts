import { Component, OnInit } from '@angular/core';
import { TabService } from '../tab.service';
@Component({
  selector: 'app-right-sidebar',
  templateUrl: './right-sidebar.component.html',
  styleUrls: ['./right-sidebar.component.css']
})
export class RightSidebarComponent implements OnInit {

  constructor(private tabService:TabService) { 
    this.tabService.SharingData.subscribe((res: any) => {  
      this.currentBrightness = res.slice(res.indexOf('(')+1,res.indexOf('%'))
      if(this.currentBrightness.toString()==""){
               this.brightness=0
      }
      else if(this.brightness!=0){

               this.brightness = this.currentBrightness-100
      }
      
      console.log( res.slice(res.indexOf('(')+1,-1))  
    }) 
  }

  currentBrightness:number
  brightness: number = 0

  ngOnInit(): void {
    document.getElementById("rightSidebar").style.width = "0px";

  }

  closeRightBar() {
    document.getElementById("rightSidebar").style.width = "0px";
    document.getElementById("main").style.marginRight = "0px";
    var elements = document.getElementsByClassName('container');
    for (var i = 0; i < elements.length; i++) {
      (elements[i] as HTMLElement).style.marginLeft = "150px"
    }
    
  }

  changeBrightness(e) {
  
    document.getElementById("img"+"_"+localStorage.getItem('imgName')).style.filter = "brightness("+(e.value+100)+"%)"
  }

}
