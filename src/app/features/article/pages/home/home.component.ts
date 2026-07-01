import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { TagsService } from "../../services/tags.service";
import { ArticleListConfig } from "../../models/article-list-config.model";
import { AsyncPipe, NgClass, NgForOf } from "@angular/common";
import { ArticleListComponent } from "../../components/article-list.component";
import { tap, filter, switchMap } from "rxjs/operators";
import { UserService } from "../../../../core/auth/services/user.service";
import { RxLet } from "@rx-angular/template/let";
import { IfAuthenticatedDirective } from "../../../../core/auth/if-authenticated.directive";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { combineLatest } from "rxjs";

@Component({
  selector: "app-home-page",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
  imports: [
    NgClass,
    ArticleListComponent,
    AsyncPipe,
    RxLet,
    NgForOf,
    IfAuthenticatedDirective,
  ],
  standalone: true,
})
export default class HomeComponent implements OnInit {
  isAuthenticated = false;
  listConfig: ArticleListConfig = {
    type: "all",
    filters: {},
  };
  tags$ = inject(TagsService)
    .getAll()
    .pipe(tap(() => (this.tagsLoaded = true)));
  tagsLoaded = false;
  destroyRef = inject(DestroyRef);

  constructor(
    private readonly router: Router,
    private readonly userService: UserService,
  ) {}

  ngOnInit(): void {
    // Subscribe to initial authentication state
    this.userService.isAuthenticated
      .pipe(
        tap((isAuthenticated) => {
          this.isAuthenticated = isAuthenticated;
          if (isAuthenticated) {
            this.setListTo("feed");
          } else {
            this.setListTo("all");
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    // Subscribe to authentication state changes for real-time updates
    this.userService.authStateChange$
      .pipe(
        filter((isAuthenticated) => isAuthenticated !== this.isAuthenticated),
        tap((isAuthenticated) => {
          this.isAuthenticated = isAuthenticated;
          
          // Clear any cached content when authentication state changes
          this.invalidateCache();
          
          // Refresh feed based on new authentication state
          if (isAuthenticated) {
            // User just logged in - switch to personalized feed
            this.setListTo("feed");
          } else {
            // User just logged out - switch to public feed
            this.setListTo("all");
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  setListTo(type: string = "", filters: Object = {}): void {
    // If feed is requested but user is not authenticated, redirect to login
    if (type === "feed" && !this.isAuthenticated) {
      void this.router.navigate(["/login"]);
      return;
    }

    // Otherwise, set the list object
    this.listConfig = { type: type, filters: filters };
  }

  private invalidateCache(): void {
    // Force refresh of the article list by creating a new config object
    // This ensures the ArticleListComponent detects the change and refetches data
    this.listConfig = { ...this.listConfig };
  }
}