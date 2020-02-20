import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { CollectionReqDTO, CollectionDetailReqDTO } from "./fetch-palace.model";

@Injectable({
  providedIn: "root"
})
export class FetchPalaceHttpService {
  public readonly CORS_PROXY = "";
  private readonly FETCH_URL = "https://openapi.npm.gov.tw/v1/rest";
  private readonly COLLECTION = "/collection/search";
  private readonly VIDEOS = "/videos/search";
  private readonly EXHIBITION = "/exhibition/search";
  private readonly ACTIVITY = "/activity/search";
  private readonly VISITORS = "/visitors/search";
  private readonly INFO = "/info/search";

  private heads: Object[] = [];
  headers: any;
  constructor(private http: HttpClient) {}

  getHeaders(): any {
    this.heads = [];
    this.heads.push(["Content-Type", "application/json"]);
    this.heads.push(["Accept", "application/json"]);
    // These always need to be set to get a valid response
    this.heads.push(["apiKey", "3234f5b1-670a-443b-81d7-cdb3a28d5672"]);

    this.headers = {};

    this.heads.map(arr => {
      this.headers[arr[0]] = arr[1];
    });
    return this.headers;
  }

  fetchCollection(collectionReqDTO: CollectionReqDTO): Observable<any> {
    let headers = new HttpHeaders(this.getHeaders());
    return this.http
      .get<any>(
        this.CORS_PROXY +
          this.FETCH_URL +
          this.COLLECTION +
          `?limit=${collectionReqDTO.limit}&offset=${collectionReqDTO.offset}&lang=${collectionReqDTO.lang}`,
        { headers }
      )
      .pipe(map(response => response.result));
  }

  fetchCollectionDetail(
    collectionDetailReqDTO: CollectionDetailReqDTO
  ): Observable<any> {
    let headers = new HttpHeaders(this.getHeaders());
    return this.http
      .get<any>(
        this.CORS_PROXY +
          this.FETCH_URL +
          this.COLLECTION +
          `/${collectionDetailReqDTO.collection_id}`,
        { headers }
      )
      .pipe(map(response => response.result));
  }
}
