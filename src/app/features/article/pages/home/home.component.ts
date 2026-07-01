import { Component, DestroyRef, inject, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { TagsService } from "../../services/tags.service";
import { ArticleListConfig } from "../../models/article-list-config.model";
import { AsyncPipe, NgClass, NgForOf } from "@angular/common";
import { ArticleListComponent } from "../../components/article-list.component";
import { tap, distinctUntilChanged } from "rxjs/operators";
import { UserService } from "../../../../core/auth/services/user.service";
import { RxLet } from "@rx-angular/template/let";
import { IfAuthenticatedDirective } from "../../../../core/auth/if-authenticated.directive";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

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
  @ViewChild(ArticleListComponent) articleListComponent!: ArticleListComponent;
  
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
    this.userService.isAuthenticated
      .pipe(
        distinctUntilChanged(),
        tap((isAuthenticated) => {
          const wasAuthenticated = this.isAuthenticated;
          this.isAuthenticated = isAuthenticated;
          
          if (isAuthenticated) {
            this.setListTo("feed");
          } else {
            this.setListTo("all");
          }
          
          // If authentication state changed and we have an article list component,
          // trigger a refresh to reload the feed with the new authentication context
          if (wasAuthenticated !== isAuthenticated && this.articleListComponent) {
            this.refreshFeed();
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

  /**
   * Refreshes the article feed by triggering a new query
   * This is called when authentication state changes to ensure
   * the feed reflects the current user's authentication status
   */
  private refreshFeed(): void {
    if (this.articleListComponent) {
      // Reset to first page and trigger a new query
      this.articleListComponent.currentPage = 1;
      this.articleListComponent.runQuery();
    }
  }
}