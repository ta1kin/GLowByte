import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // Если ответ уже имеет формат ApiResponse, возвращаем как есть
        if (data && typeof data === 'object' && 'success' in data) {
          return data as ApiResponse<T>;
        }
        // Иначе оборачиваем в стандартный формат
        return {
          success: true,
          message: 'OK',
          data,
        };
      }),
    );
  }
}

