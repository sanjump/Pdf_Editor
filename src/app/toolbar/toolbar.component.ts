import { Component, OnInit, Input, NgZone } from '@angular/core';
import { faCommentAlt } from '@fortawesome/free-solid-svg-icons';
import { faExpandArrowsAlt } from '@fortawesome/free-solid-svg-icons';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { faAdjust } from '@fortawesome/free-solid-svg-icons';
import { Output, EventEmitter } from '@angular/core';
import { IpcRenderer } from 'electron';
import { BrowserWindow } from 'electron';
import { FilterCommentsService } from '../filter-comments.service'
import { TabService } from '../tab.service';
import { faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { faSearchMinus } from '@fortawesome/free-solid-svg-icons';
import { faBold } from '@fortawesome/free-solid-svg-icons';
import { faItalic } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})

export class ToolbarComponent implements OnInit {

  constructor(private filterService: FilterCommentsService, private tabService: TabService, private zone: NgZone) {

  }

  @Input() tabheader: string
  @Input() tabcontent: string
  @Output() textboxes = new EventEmitter<any>();
  @Output() zoomScale = new EventEmitter<any>();
  @Output() rotateDegree = new EventEmitter<any>();

  ipc: IpcRenderer
  win: BrowserWindow
  comment: string = ""
  faSearchPlus = faSearchPlus
  faSearchMinus = faSearchMinus
  faCommentAlt = faCommentAlt
  faSyncAlt = faSyncAlt
  faAdjust = faAdjust
  faBold = faBold
  faItalic = faItalic
  faExpandArrowsAlt = faExpandArrowsAlt;
  json: any[] = [];
  i: number = 0;
  l: number;
  inputElements: any
  inputTextboxes: any[] = []
  displaySave: boolean
  overlay: any;
  filterData: any = []
  annotations: any
  tabs: any = []
  url = ""
  scale: number = 1
  degree: number = 0


  ngOnInit(): void {

    this.ipc = (<any>window).require('electron').ipcRenderer;
    if (this.tabheader === undefined) {

      this.tabheader = localStorage.getItem('tabheader')

    }


    this.ipc.once('data', (event, args) => {

      this.zone.run(() => {
        if (args != "No file" && args.length > 0) {

          this.scale = Number(args[0].imgTransform.slice(args[0].imgTransform.indexOf('(') + 1, args[0].imgTransform.indexOf(')')))
          this.degree = Number(args[0].containerTransform.slice(args[0].containerTransform.indexOf('(') + 1, args[0].containerTransform.indexOf(')') - 3));
          this.zoomScale.emit(this.scale);
          this.rotateDegree.emit(this.degree);

        }
        else {
          this.zoomScale.emit(1)
          this.rotateDegree.emit(0)
        }

      });
    });

  }

  setTextboxes(value: any) {
    this.textboxes.emit(value);

  }

  setZoomScale(value: any) {
    this.zoomScale.emit(value);

  }

  setrotateDegree(value: any) {
    this.rotateDegree.emit(value);
  }

  addTextbox() {
    this.inputTextboxes.push(this.i + "_" + this.tabheader)
    this.setTextboxes(this.inputTextboxes)
    this.i += 1

  }

  openRightBar() {

    document.getElementById("rightSidebar").style.width = "300px";
    document.getElementById("main").style.marginRight = "300px";
    document.getElementById("mySidebar").style.width = "0px";
    document.getElementById("main").style.marginLeft = "0px";
    document.getElementById("open").hidden = false;
    var elements = document.getElementsByClassName('container');
    for (var i = 0; i < elements.length; i++) {
      (elements[i] as HTMLElement).style.margin = "15px";
      (elements[i] as HTMLElement).style.marginRight = "30px";
    }
    localStorage.setItem('imgName', this.tabheader)
    this.tabService.SharingData.next(document.getElementById('img' + "_" + this.tabheader).style.filter)
  }

  clearFind() {


    this.comment = "";
    for (var i = 0; i < this.annotations.length; i++) {

      this.annotations[i].style.backgroundColor = "white"
    }

  }


  zoomIn() {
    this.scale += .1
    this.setZoomScale(this.scale)
  }

  zoomOut() {
    if (this.scale > 1) {
      this.scale -= .1
      this.setZoomScale(this.scale)
    }

  }

  rotate() {
    this.degree += 90
    this.setrotateDegree(this.degree)
  }

  makeBold(){

    if(document.getElementById(localStorage.getItem('selectedText')).style.fontWeight == "bold"){
      document.getElementById(localStorage.getItem('selectedText')).style.fontWeight = "normal"
    }
    else{
      document.getElementById(localStorage.getItem('selectedText')).style.fontWeight = "bold"
    }
    
  }

  makeItalic(){

    if(document.getElementById(localStorage.getItem('selectedText')).style.fontStyle == "italic"){
      document.getElementById(localStorage.getItem('selectedText')).style.fontStyle = "normal"
    }
    else{
      document.getElementById(localStorage.getItem('selectedText')).style.fontStyle = "italic"
    }
  }

  search(comment) {

    this.filterService.filter(this.tabheader).subscribe(data => { this.filterData = data })

    setTimeout(() => {

      this.annotations = document.getElementsByClassName(this.filterData[0].class)
      for (var i = 0; i < this.annotations.length; i++) {
        if (this.annotations[i].value.includes(comment) && comment != "") {
          this.annotations[i].style.backgroundColor = "yellow"
        }
        else {
          this.annotations[i].style.backgroundColor = "white"
        }
      }

    }, 200);
  }

  export() {

    localStorage.setItem('fileName', this.tabheader)
    this.ipc.send("export", '');
  }


  fullScreen() {

    this.tabs = this.tabService.getTabs()
    for (var i = 0; i < this.tabs.length; i++) {
      if (this.tabs[i].header == this.tabheader) {
        this.url = this.tabs[i].content
        break
      }
    }
    localStorage.setItem('tabheader', this.tabheader)
    localStorage.setItem('imgUrl', this.url)
    this.ipc.send("fullScreen", this.tabheader)
  }



  save(e) {

    this.json = []
    this.inputElements = document.getElementsByClassName("input" + "_" + e.target.id)
    this.overlay = document.getElementById('overlay' + "_" + e.target.id).getBoundingClientRect()
    this.l = this.inputElements.length;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    var date = dd + '-' + mm + '-' + yyyy;

    while (this.l--) {
      this.json.push({
        file: this.tabheader,
        date: date,
        type: this.inputElements[this.l].type,
        id: this.inputElements[this.l].id,
        class: this.inputElements[this.l].className,
        value: this.inputElements[this.l].value,
        fontWeight:this.inputElements[this.l].style.fontWeight,
        fontStyle:this.inputElements[this.l].style.fontStyle,
        imgTransform: document.getElementById('img' + "_" + e.target.id).style.transform,
        containerTransform: document.getElementById('panel' + "_" + e.target.id).style.transform,
        filters: document.getElementById('img' + "_" + e.target.id).style.filter,
        width: this.inputElements[this.l].style.width,
        height: this.inputElements[this.l].style.height,
        position: {
          left: (this.inputElements[this.l] as HTMLElement).getBoundingClientRect().left - this.overlay.left,
          top: (this.inputElements[this.l] as HTMLElement).getBoundingClientRect().top - this.overlay.top
        }
      });

    }

    if (this.json.length > 0) {

      this.ipc.send("file", this.json);
      this.displaySave = true

    }


  }
}
