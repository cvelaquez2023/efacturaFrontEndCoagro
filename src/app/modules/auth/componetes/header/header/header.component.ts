import { environment } from "src/environments/environment";
import { PATHS_AUTH_PAGES } from "./../../../../../config/path-pages";
import { Component } from "@angular/core";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent {
  registerPath = PATHS_AUTH_PAGES.registerPage.withSlash;
  empresa = environment.empresa;
}
