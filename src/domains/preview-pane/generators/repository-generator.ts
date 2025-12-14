/**
 * Repository Generator
 * 
 * Generates Repository pattern implementation for ALL entities with:
 * - IRepository<T> generic interface
 * - Repository<T> base implementation
 * - Entity-specific interfaces and implementations
 * - Async operations
 * - Specification pattern support
 */

import type { DataModel, Entity } from '@/shared/schemas';
import {
  toPascalCase,
  getNamespace,
  getPrimaryKeyField,
  joinLines,
} from './helpers';
import { CSHARP_TYPE_MAP } from './types';

/**
 * Generate generic IRepository interface
 */
function generateIRepository(): string[] {
  const lines: string[] = [];
  
  lines.push('/// <summary>');
  lines.push('/// Generic repository interface');
  lines.push('/// </summary>');
  lines.push('public interface IRepository<T> where T : class');
  lines.push('{');
  lines.push('    Task<T?> GetByIdAsync<TKey>(TKey id, CancellationToken cancellationToken = default);');
  lines.push('    Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default);');
  lines.push('    Task<IEnumerable<T>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);');
  lines.push('    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);');
  lines.push('    Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);');
  lines.push('    Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);');
  lines.push('    Task<int> CountAsync(CancellationToken cancellationToken = default);');
  lines.push('    Task<int> CountAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);');
  lines.push('    Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);');
  lines.push('    Task<IEnumerable<T>> AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default);');
  lines.push('    Task UpdateAsync(T entity, CancellationToken cancellationToken = default);');
  lines.push('    Task DeleteAsync(T entity, CancellationToken cancellationToken = default);');
  lines.push('    Task DeleteRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default);');
  lines.push('}');
  
  return lines;
}

/**
 * Generate base Repository implementation
 */
function generateRepository(dbContextName: string): string[] {
  const lines: string[] = [];
  
  lines.push('/// <summary>');
  lines.push('/// Generic repository implementation');
  lines.push('/// </summary>');
  lines.push(`public class Repository<T> : IRepository<T> where T : class`);
  lines.push('{');
  lines.push(`    protected readonly ${dbContextName} _context;`);
  lines.push('    protected readonly DbSet<T> _dbSet;');
  lines.push('');
  lines.push(`    public Repository(${dbContextName} context)`);
  lines.push('    {');
  lines.push('        _context = context;');
  lines.push('        _dbSet = context.Set<T>();');
  lines.push('    }');
  lines.push('');
  
  // GetByIdAsync
  lines.push('    public virtual async Task<T?> GetByIdAsync<TKey>(TKey id, CancellationToken cancellationToken = default)');
  lines.push('    {');
  lines.push('        return await _dbSet.FindAsync(new object[] { id! }, cancellationToken);');
  lines.push('    }');
  lines.push('');
  
  // GetAllAsync
  lines.push('    public virtual async Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default)');
  lines.push('    {');
  lines.push('        return await _dbSet.ToListAsync(cancellationToken);');
  lines.push('    }');
  lines.push('');
  
  // GetPagedAsync
  lines.push('    public virtual async Task<IEnumerable<T>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)');
  lines.push('    {');
  lines.push('        return await _dbSet');
  lines.push('            .Skip((page - 1) * pageSize)');
  lines.push('            .Take(pageSize)');
  lines.push('            .ToListAsync(cancellationToken);');
  lines.push('    }');
  lines.push('');
  
  // FindAsync
  lines.push('    public virtual async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)');
  lines.push('    {');
  lines.push('        return await _dbSet.Where(predicate).ToListAsync(cancellationToken);');
  lines.push('    }');
  lines.push('');
  
  // FirstOrDefaultAsync
  lines.push('    public virtual async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)');
  lines.push('    {');
  lines.push('        return await _dbSet.FirstOrDefaultAsync(predicate, cancellationToken);');
  lines.push('    }');
  lines.push('');
  
  // AnyAsync
  lines.push('    public virtual async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)');
  lines.push('    {');
  lines.push('        return await _dbSet.AnyAsync(predicate, cancellationToken);');
  lines.push('    }');
  lines.push('');
  
  // CountAsync
  lines.push('    public virtual async Task<int> CountAsync(CancellationToken cancellationToken = default)');
  lines.push('    {');
  lines.push('        return await _dbSet.CountAsync(cancellationToken);');
  lines.push('    }');
  lines.push('');
  
  // CountAsync with predicate
  lines.push('    public virtual async Task<int> CountAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)');
  lines.push('    {');
  lines.push('        return await _dbSet.CountAsync(predicate, cancellationToken);');
  lines.push('    }');
  lines.push('');
  
  // AddAsync
  lines.push('    public virtual async Task<T> AddAsync(T entity, CancellationToken cancellationToken = default)');
  lines.push('    {');
  lines.push('        var entry = await _dbSet.AddAsync(entity, cancellationToken);');
  lines.push('        await _context.SaveChangesAsync(cancellationToken);');
  lines.push('        return entry.Entity;');
  lines.push('    }');
  lines.push('');
  
  // AddRangeAsync
  lines.push('    public virtual async Task<IEnumerable<T>> AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default)');
  lines.push('    {');
  lines.push('        await _dbSet.AddRangeAsync(entities, cancellationToken);');
  lines.push('        await _context.SaveChangesAsync(cancellationToken);');
  lines.push('        return entities;');
  lines.push('    }');
  lines.push('');
  
  // UpdateAsync
  lines.push('    public virtual async Task UpdateAsync(T entity, CancellationToken cancellationToken = default)');
  lines.push('    {');
  lines.push('        _dbSet.Update(entity);');
  lines.push('        await _context.SaveChangesAsync(cancellationToken);');
  lines.push('    }');
  lines.push('');
  
  // DeleteAsync
  lines.push('    public virtual async Task DeleteAsync(T entity, CancellationToken cancellationToken = default)');
  lines.push('    {');
  lines.push('        _dbSet.Remove(entity);');
  lines.push('        await _context.SaveChangesAsync(cancellationToken);');
  lines.push('    }');
  lines.push('');
  
  // DeleteRangeAsync
  lines.push('    public virtual async Task DeleteRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default)');
  lines.push('    {');
  lines.push('        _dbSet.RemoveRange(entities);');
  lines.push('        await _context.SaveChangesAsync(cancellationToken);');
  lines.push('    }');
  
  lines.push('}');
  
  return lines;
}

/**
 * Generate entity-specific repository interface
 */
function generateEntityInterface(entity: Entity): string[] {
  const entityName = toPascalCase(entity.name);
  const pkField = getPrimaryKeyField(entity);
  const pkType = pkField ? (CSHARP_TYPE_MAP[pkField.type] || 'Guid') : 'Guid';
  
  const lines: string[] = [];
  
  lines.push(`public interface I${entityName}Repository : IRepository<${entityName}>`);
  lines.push('{');
  lines.push(`    Task<${entityName}?> GetByIdAsync(${pkType} id, CancellationToken cancellationToken = default);`);
  lines.push(`    Task<${entityName}?> GetByIdWithRelationsAsync(${pkType} id, CancellationToken cancellationToken = default);`);
  lines.push('}');
  
  return lines;
}

/**
 * Generate entity-specific repository implementation
 */
function generateEntityRepository(entity: Entity, dbContextName: string): string[] {
  const entityName = toPascalCase(entity.name);
  const pkField = getPrimaryKeyField(entity);
  const pkType = pkField ? (CSHARP_TYPE_MAP[pkField.type] || 'Guid') : 'Guid';
  const pkName = pkField ? toPascalCase(pkField.name) : 'Id';
  
  const lines: string[] = [];
  
  lines.push(`public class ${entityName}Repository : Repository<${entityName}>, I${entityName}Repository`);
  lines.push('{');
  lines.push(`    public ${entityName}Repository(${dbContextName} context) : base(context)`);
  lines.push('    {');
  lines.push('    }');
  lines.push('');
  
  // GetByIdAsync
  lines.push(`    public async Task<${entityName}?> GetByIdAsync(${pkType} id, CancellationToken cancellationToken = default)`);
  lines.push('    {');
  lines.push(`        return await _dbSet.FirstOrDefaultAsync(e => e.${pkName} == id, cancellationToken);`);
  lines.push('    }');
  lines.push('');
  
  // GetByIdWithRelationsAsync
  lines.push(`    public async Task<${entityName}?> GetByIdWithRelationsAsync(${pkType} id, CancellationToken cancellationToken = default)`);
  lines.push('    {');
  lines.push(`        return await _dbSet`);
  lines.push('            // Add .Include() calls for related entities here');
  lines.push(`            .FirstOrDefaultAsync(e => e.${pkName} == id, cancellationToken);`);
  lines.push('    }');
  
  lines.push('}');
  
  return lines;
}

/**
 * Generate service interface for entity
 */
function generateEntityServiceInterface(entity: Entity): string[] {
  const entityName = toPascalCase(entity.name);
  const pkField = getPrimaryKeyField(entity);
  const pkType = pkField ? (CSHARP_TYPE_MAP[pkField.type] || 'Guid') : 'Guid';
  
  const lines: string[] = [];
  
  lines.push(`public interface I${entityName}Service`);
  lines.push('{');
  lines.push(`    Task<IEnumerable<${entityName}ResponseDto>> GetAllAsync(int page = 1, int pageSize = 20);`);
  lines.push(`    Task<${entityName}ResponseDto?> GetByIdAsync(${pkType} id);`);
  lines.push(`    Task<${entityName}ResponseDto> CreateAsync(Create${entityName}Dto dto);`);
  lines.push(`    Task<${entityName}ResponseDto?> UpdateAsync(${pkType} id, Update${entityName}Dto dto);`);
  lines.push(`    Task<bool> DeleteAsync(${pkType} id);`);
  lines.push('}');
  
  return lines;
}

/**
 * Generate service implementation for entity
 */
function generateEntityService(entity: Entity): string[] {
  const entityName = toPascalCase(entity.name);
  const pkField = getPrimaryKeyField(entity);
  const pkType = pkField ? (CSHARP_TYPE_MAP[pkField.type] || 'Guid') : 'Guid';
  
  const lines: string[] = [];
  
  lines.push(`public class ${entityName}Service : I${entityName}Service`);
  lines.push('{');
  lines.push(`    private readonly I${entityName}Repository _repository;`);
  lines.push(`    private readonly IMapper _mapper;`);
  lines.push('');
  lines.push(`    public ${entityName}Service(I${entityName}Repository repository, IMapper mapper)`);
  lines.push('    {');
  lines.push('        _repository = repository;');
  lines.push('        _mapper = mapper;');
  lines.push('    }');
  lines.push('');
  
  // GetAllAsync
  lines.push(`    public async Task<IEnumerable<${entityName}ResponseDto>> GetAllAsync(int page = 1, int pageSize = 20)`);
  lines.push('    {');
  lines.push('        var entities = await _repository.GetPagedAsync(page, pageSize);');
  lines.push(`        return _mapper.Map<IEnumerable<${entityName}ResponseDto>>(entities);`);
  lines.push('    }');
  lines.push('');
  
  // GetByIdAsync
  lines.push(`    public async Task<${entityName}ResponseDto?> GetByIdAsync(${pkType} id)`);
  lines.push('    {');
  lines.push('        var entity = await _repository.GetByIdAsync(id);');
  lines.push('        if (entity == null) return null;');
  lines.push(`        return _mapper.Map<${entityName}ResponseDto>(entity);`);
  lines.push('    }');
  lines.push('');
  
  // CreateAsync
  lines.push(`    public async Task<${entityName}ResponseDto> CreateAsync(Create${entityName}Dto dto)`);
  lines.push('    {');
  lines.push(`        var entity = _mapper.Map<${entityName}>(dto);`);
  lines.push('        entity = await _repository.AddAsync(entity);');
  lines.push(`        return _mapper.Map<${entityName}ResponseDto>(entity);`);
  lines.push('    }');
  lines.push('');
  
  // UpdateAsync
  lines.push(`    public async Task<${entityName}ResponseDto?> UpdateAsync(${pkType} id, Update${entityName}Dto dto)`);
  lines.push('    {');
  lines.push('        var entity = await _repository.GetByIdAsync(id);');
  lines.push('        if (entity == null) return null;');
  lines.push('');
  lines.push('        _mapper.Map(dto, entity);');
  lines.push('        await _repository.UpdateAsync(entity);');
  lines.push(`        return _mapper.Map<${entityName}ResponseDto>(entity);`);
  lines.push('    }');
  lines.push('');
  
  // DeleteAsync
  lines.push(`    public async Task<bool> DeleteAsync(${pkType} id)`);
  lines.push('    {');
  lines.push('        var entity = await _repository.GetByIdAsync(id);');
  lines.push('        if (entity == null) return false;');
  lines.push('');
  lines.push('        await _repository.DeleteAsync(entity);');
  lines.push('        return true;');
  lines.push('    }');
  
  lines.push('}');
  
  return lines;
}

/**
 * Generate complete repository layer
 */
export function generateRepositories(model: DataModel): string {
  if (model.entities.length === 0) {
    return '// No entities to generate repositories for';
  }
  
  const namespace = getNamespace(model.name);
  const dbContextName = `${toPascalCase(model.name)}DbContext`;
  
  const lines: string[] = [];
  
  // Using statements
  lines.push('using System;');
  lines.push('using System.Collections.Generic;');
  lines.push('using System.Linq;');
  lines.push('using System.Linq.Expressions;');
  lines.push('using System.Threading;');
  lines.push('using System.Threading.Tasks;');
  lines.push('using AutoMapper;');
  lines.push('using Microsoft.EntityFrameworkCore;');
  lines.push(`using ${namespace}.Data;`);
  lines.push(`using ${namespace}.DTOs;`);
  lines.push(`using ${namespace}.Entities;`);
  lines.push('');
  lines.push(`namespace ${namespace}.Repositories;`);
  lines.push('');
  
  // Generate generic interface
  lines.push('// ===========================================');
  lines.push('// Generic Repository Interface');
  lines.push('// ===========================================');
  lines.push('');
  lines.push(...generateIRepository());
  lines.push('');
  
  // Generate generic implementation
  lines.push('// ===========================================');
  lines.push('// Generic Repository Implementation');
  lines.push('// ===========================================');
  lines.push('');
  lines.push(...generateRepository(dbContextName));
  lines.push('');
  
  // Generate entity-specific interfaces
  lines.push('// ===========================================');
  lines.push('// Entity-specific Repository Interfaces');
  lines.push('// ===========================================');
  lines.push('');
  
  for (const entity of model.entities) {
    lines.push(...generateEntityInterface(entity));
    lines.push('');
  }
  
  // Generate entity-specific implementations
  lines.push('// ===========================================');
  lines.push('// Entity-specific Repository Implementations');
  lines.push('// ===========================================');
  lines.push('');
  
  for (const entity of model.entities) {
    lines.push(...generateEntityRepository(entity, dbContextName));
    lines.push('');
  }
  
  return joinLines(lines);
}

/**
 * Generate complete service layer
 */
export function generateServices(model: DataModel): string {
  if (model.entities.length === 0) {
    return '// No entities to generate services for';
  }
  
  const namespace = getNamespace(model.name);
  
  const lines: string[] = [];
  
  // Using statements
  lines.push('using System;');
  lines.push('using System.Collections.Generic;');
  lines.push('using System.Threading.Tasks;');
  lines.push('using AutoMapper;');
  lines.push(`using ${namespace}.DTOs;`);
  lines.push(`using ${namespace}.Entities;`);
  lines.push(`using ${namespace}.Repositories;`);
  lines.push('');
  lines.push(`namespace ${namespace}.Services;`);
  lines.push('');
  
  // Generate service interfaces
  lines.push('// ===========================================');
  lines.push('// Service Interfaces');
  lines.push('// ===========================================');
  lines.push('');
  
  for (const entity of model.entities) {
    lines.push(...generateEntityServiceInterface(entity));
    lines.push('');
  }
  
  // Generate service implementations
  lines.push('// ===========================================');
  lines.push('// Service Implementations');
  lines.push('// ===========================================');
  lines.push('');
  
  for (const entity of model.entities) {
    lines.push(...generateEntityService(entity));
    lines.push('');
  }
  
  return joinLines(lines);
}
