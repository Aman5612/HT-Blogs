import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BlogListItem {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  slug: string;
  excerpt: string;
  status: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  media: any[];
  cardBlocks: any[];
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = 'https://blog-cms.opengig.works/api';

  constructor(private http: HttpClient) {}

  getAllPosts(): Observable<BlogListItem[]> {
    return this.http.get<BlogListItem[]>(`${this.apiUrl}/posts`);
  }

  getPost(id: string): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.apiUrl}/posts/${id}`);
  }
}
