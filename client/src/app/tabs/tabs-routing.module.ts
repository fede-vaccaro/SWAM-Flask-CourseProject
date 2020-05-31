import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { FriendsListComponent } from './profile/friends-list/friends-list.component';
import { FriendTicketsComponent } from './status/friend-tickets/friend-tickets.component';
import { TicketHistoryComponent } from './profile/ticket-history/ticket-history.component';
import { SplitTicketPage } from '../components/split-ticket/split-ticket.page';
import { PaidTicketComponent } from './profile/paid-ticket/paid-ticket.component';
import { CameraScanComponent } from '../components/camera-scan/camera-scan.component';
import { MyTicketComponent } from './profile/my-ticket/my-ticket.component';
import { AuthGuard } from '../guards/auth.guard';

const routes: Routes = [
    {
        path: 'login',
        children: [
            {
                path: '',
                loadChildren: () =>
                    import('../login/login.module').then(m => m.LoginPageModule)
            },
        ],
    },
    {
        path: 'tabs',
        canActivate: [AuthGuard],
        component: TabsPage,
        children: [
            {
                path: 'status',
                children: [
                    {
                        path: '',
                        loadChildren: () => import('../tabs/status/status.module').then(m => m.StatusPageModule),
                    },
                    {
                        path: 'friend-tickets',
                        component: FriendTicketsComponent,
                    },
                ]
            },
            {
                path: 'ticket',
                children: [
                    {
                        path: '',
                        redirectTo: '/tabs/ticket/import',
                        pathMatch: 'full'
                    },
                    {
                        path: 'import',
                        loadChildren: () =>
                            import('../tabs/import-ticket/import-ticket.module').then(m => m.ImportTicketPageModule)
                    },
                    {
                        path: 'camera',
                        component: CameraScanComponent,
                    },
                    {
                        path: 'split',
                        component: SplitTicketPage,
                    },

                ]
            },
            {
                path: 'profile',
                children: [
                    {
                        path: '',
                        loadChildren: () =>
                            import('../tabs/profile/profile.module').then(m => m.ProfilePageModule),
                    },
                    {
                        path: 'friends-list',
                        component: FriendsListComponent,
                    },
                    {
                        path: 'my-ticket',
                        component: MyTicketComponent,
                    },
                    {
                        path: 'paid-ticket',
                        component: PaidTicketComponent,
                    },
                    {
                        path: 'ticket-history',
                        component: TicketHistoryComponent,
                    },
                    {
                        path: 'show-ticket',
                        component: SplitTicketPage,
                    },
                ],
            },
            {
                path: '',
                redirectTo: '/login',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TabsPageRoutingModule {
}
