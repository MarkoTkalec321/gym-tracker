import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RegisterComponent } from './auth/register/register.component';
import { AppRoutingModule } from './app-routing.module';
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './home/home.component';
import {MatToolbarModule} from "@angular/material/toolbar";
import { WelcomeComponent } from './welcome/welcome.component';
import {MatDividerModule} from "@angular/material/divider";
import {MatTabsModule} from "@angular/material/tabs";
import { ToolbarComponent } from './toolbar/toolbar.component';
import { ProfileComponent } from './profile/profile.component';
import {MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule} from "@angular/material/dialog";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatLineModule, MatNativeDateModule} from "@angular/material/core";
import { CoachComponent } from './coach/coach.component';
import { GroupClientsComponent } from './dialog/group-clients/group-clients.component';
import { GroupDialogComponent } from './dialog/group-dialog/group-dialog.component';
import {MatListModule} from "@angular/material/list";
import {MatIconModule} from "@angular/material/icon";
import { AddClientsComponent } from './dialog/add-clients/add-clients.component';
import {MatTableModule} from "@angular/material/table";
import {MatSelectModule} from "@angular/material/select";
import { DeleteClientComponent } from './dialog/delete-client/delete-client.component';
import { TrainingSessionDialogComponent } from './dialog/training-session-dialog/training-session-dialog.component';
import { HttpClientModule } from '@angular/common/http';
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {
  TrainingSessionsDialogViewComponent
} from "./dialog/training-sessions-dialog-view/training-sessions-dialog-view.component";
import {FullCalendarModule} from "@fullcalendar/angular";
import { TrainingSessionsDeleteDialogComponent } from './dialog/training-sessions-delete-dialog/training-sessions-delete-dialog.component';
import { ForumComponent } from './forum/forum.component';
import { CreateThreadDialogComponent } from './dialog/create-thread-dialog/create-thread-dialog.component';
import { ThreadDeleteDialogComponent } from './dialog/thread-delete-dialog/thread-delete-dialog.component';
import {MatTooltipModule} from "@angular/material/tooltip";
import { ThreadDetailComponent } from './dialog/thread-detail/thread-detail.component';
import {MatMenuModule} from "@angular/material/menu";
import { SocialComponent } from './social/social.component';
import {CometChatConversationsWithMessages} from "@cometchat/chat-uikit-angular";
import { AdminComponent } from './admin/admin.component';
import {MatProgressBarModule} from "@angular/material/progress-bar";
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';


@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    HomeComponent,
    WelcomeComponent,
    ToolbarComponent,
    ProfileComponent,
    CoachComponent,
    GroupClientsComponent,
    GroupDialogComponent,
    AddClientsComponent,
    DeleteClientComponent,
    TrainingSessionDialogComponent,
    TrainingSessionsDialogViewComponent,
    TrainingSessionsDeleteDialogComponent,
    ForumComponent,
    CreateThreadDialogComponent,
    ThreadDeleteDialogComponent,
    ThreadDetailComponent,
    SocialComponent,
    AdminComponent,
    ConfirmationDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatDividerModule,
    MatTabsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatListModule,
    MatIconModule,
    MatTableModule,
    MatSelectModule,
    MatLineModule,
    HttpClientModule,
    MatAutocompleteModule,
    FullCalendarModule,
    MatTooltipModule,
    MatMenuModule,
    CometChatConversationsWithMessages,
    FormsModule,
    MatProgressBarModule
  ],
  providers: [
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {
        hasBackdrop: true,
        disableClose: false,
        width: '400px',
        autoFocus: true
      }
    }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule { }
