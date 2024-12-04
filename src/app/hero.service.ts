import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Hero } from './hero';
import { MessageService } from './message.service';

@Injectable({ providedIn: 'root' })
export class HeroService {

  private heroesUrl = 'api/heroes';  // URL para la API web

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  /** GET: obtiene los héroes del servidor */
  getHeroes(): Observable<Hero[]> {
    return this.http.get<Hero[]>(this.heroesUrl)
      .pipe(
        tap(_ => this.log('héroes obtenidos')),
        catchError(this.handleError<Hero[]>('getHeroes', []))
      );
  }

  /** GET: obtiene un héroe por id. Devuelve `undefined` si no se encuentra el id */
  getHeroNo404<Data>(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/?id=${id}`;
    return this.http.get<Hero[]>(url)
      .pipe(
        map(heroes => heroes[0]), // devuelve un array con {0|1} elementos
        tap(h => {
          const outcome = h ? 'obtenido' : 'no encontrado';
          this.log(`${outcome} héroe con id=${id}`);
        }),
        catchError(this.handleError<Hero>(`getHero id=${id}`))
      );
  }

  /** GET: obtiene un héroe por id. Generará un error 404 si el id no se encuentra */
  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.get<Hero>(url).pipe(
      tap(_ => this.log(`héroe con id=${id} obtenido`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    );
  }

  /* GET: obtiene héroes cuyo nombre contiene el término de búsqueda */
  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      // si no hay un término de búsqueda, devuelve un array vacío.
      return of([]);
    }
    return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}`).pipe(
      tap(x => x.length ?
         this.log(`héroes encontrados que coinciden con "${term}"`) :
         this.log(`no se encontraron héroes que coincidan con "${term}"`)),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    );
  }

  //////// Métodos para guardar datos ////////

  /** POST: agrega un nuevo héroe al servidor */
  addHero(hero: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, this.httpOptions).pipe(
      tap((newHero: Hero) => this.log(`héroe agregado con id=${newHero.id}`)),
      catchError(this.handleError<Hero>('addHero'))
    );
  }

  /** DELETE: elimina el héroe del servidor */
  deleteHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url, this.httpOptions).pipe(
      tap(_ => this.log(`héroe con id=${id} eliminado`)),
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }

  /** PUT: actualiza el héroe en el servidor */
  updateHero(hero: Hero): Observable<any> {
    return this.http.put(this.heroesUrl, hero, this.httpOptions).pipe(
      tap(_ => this.log(`héroe con id=${hero.id} actualizado`)),
      catchError(this.handleError<any>('updateHero'))
    );
  }

  /**
   * Maneja operaciones HTTP que fallaron.
   * Permite que la aplicación continúe.
   *
   * @param operation - nombre de la operación que falló
   * @param result - valor opcional a devolver como resultado del observable
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: enviar el error a una infraestructura de registro remoto
      console.error(error); // registrar en la consola por ahora

      // TODO: mejorar la transformación del error para el usuario
      this.log(`${operation} falló: ${error.message}`);

      // Permite que la aplicación siga funcionando devolviendo un resultado vacío.
      return of(result as T);
    };
  }

  /** Registra un mensaje del servicio HeroService con el MessageService */
  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`);
  }
}
