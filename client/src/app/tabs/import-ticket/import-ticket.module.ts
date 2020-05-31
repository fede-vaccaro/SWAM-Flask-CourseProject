import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { UserRepositoryService } from 'src/app/repositories/user-repository.service';
import { LoginService } from 'src/app/services/login.service';
import { ImportTicketPage } from './import-ticket.page';
import { SelectMarketComponent } from './select-market/select-market.component';
import { SelectMethodComponent } from './select-method/select-method.component';
import { SelectParticipantsComponent } from './select-participants/select-participants.component';
import { CameraScanComponent } from 'src/app/components/camera-scan/camera-scan.component';
import { CameraScanService } from 'src/app/services/camera-scan.service';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: ImportTicketPage }])
  ],
  declarations: [
    ImportTicketPage,
    SelectMarketComponent,
    SelectMethodComponent,
    SelectParticipantsComponent,
  ],
  providers: [UserRepositoryService, LoginService, CameraScanService]
})
export class ImportTicketPageModule { }
