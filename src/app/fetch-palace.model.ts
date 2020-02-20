export class CollectionReqDTO {
  limit?: number;
  offset?: number;
  lang?: string;
}

export class CollectionResDTO {
  Serial_No?: number;
  ArticleSubject?: string;
  CateGory?: string;
  Slogan?: string;
  art_room?: string;
}

export class CollectionDetailReqDTO {
  collection_id?: number;
  lang?: string;
}

export class CollectionDetailResDTO {
  Serial_No?: number;
  ArticleSubject?: string;
  CateGory?: string;
  Slogan?: string;
  ArticleMaker?: string;
  ArticleContext?: string;
  ArticleRemarks?: string;
  art_room?: string;
  imgUrl?: string;
}
