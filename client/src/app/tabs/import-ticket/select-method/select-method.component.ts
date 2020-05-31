import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';

@Component({
  selector: 'app-select-method',
  templateUrl: './select-method.component.html',
  styleUrls: ['./select-method.component.scss'],
})
export class SelectMethodComponent implements OnInit {
  @Input()
  method: string
  @Output()
  methodChanged = new EventEmitter<string>()

  methods: Method[] = [
    { name: "pdf", icon: '../../../../assets/icon/pdf.svg.png' },
    { name: "camera", icon: '../../../../assets/icon/camera.png' },
    { name: "manual", icon: '../../../../assets/icon/manual.png' },
  ]

  constructor() { }

  ngOnInit() { }

  updateMethod(method: Method): void {
    this.method = method.name
    this.methodChanged.emit(this.method)
  }

  isSelected(method: Method): boolean {
    return this.method === method.name
  }
}

declare interface Method {
  name: string,
  icon: string,
}
