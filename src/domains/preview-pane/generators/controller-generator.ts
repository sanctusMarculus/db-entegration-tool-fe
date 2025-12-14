/**
 * Controller Generator
 * 
 * Generates ASP.NET Core API controllers for ALL entities with:
 * - Full CRUD operations
 * - Proper routing
 * - Service injection
 * - HTTP status codes
 * - Response types
 */

import type { DataModel, Entity } from '@/shared/schemas';
import {
  toPascalCase,
  toCamelCase,
  toPlural,
  getNamespace,
  getPrimaryKeyField,
  joinLines,
} from './helpers';
import { CSHARP_TYPE_MAP } from './types';

/**
 * Generate controller for a single entity
 */
function generateEntityController(entity: Entity): string[] {
  const lines: string[] = [];
  const entityName = toPascalCase(entity.name);
  const entityNamePlural = toPlural(entityName);
  const entityNameCamel = toCamelCase(entity.name);
  
  // Get primary key info
  const pkField = getPrimaryKeyField(entity);
  const pkType = pkField ? (CSHARP_TYPE_MAP[pkField.type] || 'Guid') : 'Guid';
  const pkName = pkField ? toPascalCase(pkField.name) : 'Id';
  
  // Controller class
  lines.push('[ApiController]');
  lines.push(`[Route("api/[controller]")]`);
  lines.push(`[Produces("application/json")]`);
  lines.push(`public class ${entityNamePlural}Controller : ControllerBase`);
  lines.push('{');
  
  // Private fields
  lines.push(`    private readonly I${entityName}Service _${entityNameCamel}Service;`);
  lines.push(`    private readonly ILogger<${entityNamePlural}Controller> _logger;`);
  lines.push('');
  
  // Constructor
  lines.push(`    public ${entityNamePlural}Controller(`);
  lines.push(`        I${entityName}Service ${entityNameCamel}Service,`);
  lines.push(`        ILogger<${entityNamePlural}Controller> logger)`);
  lines.push('    {');
  lines.push(`        _${entityNameCamel}Service = ${entityNameCamel}Service;`);
  lines.push('        _logger = logger;');
  lines.push('    }');
  lines.push('');
  
  // GET all
  lines.push('    /// <summary>');
  lines.push(`    /// Get all ${entityNamePlural}`);
  lines.push('    /// </summary>');
  lines.push(`    [HttpGet]`);
  lines.push(`    [ProducesResponseType(typeof(IEnumerable<${entityName}ResponseDto>), StatusCodes.Status200OK)]`);
  lines.push(`    public async Task<ActionResult<IEnumerable<${entityName}ResponseDto>>> GetAll(`);
  lines.push('        [FromQuery] int page = 1,');
  lines.push('        [FromQuery] int pageSize = 20)');
  lines.push('    {');
  lines.push(`        var items = await _${entityNameCamel}Service.GetAllAsync(page, pageSize);`);
  lines.push('        return Ok(items);');
  lines.push('    }');
  lines.push('');
  
  // GET by ID
  lines.push('    /// <summary>');
  lines.push(`    /// Get ${entityName} by ID`);
  lines.push('    /// </summary>');
  lines.push(`    [HttpGet("{id}")]`);
  lines.push(`    [ProducesResponseType(typeof(${entityName}ResponseDto), StatusCodes.Status200OK)]`);
  lines.push('    [ProducesResponseType(StatusCodes.Status404NotFound)]');
  lines.push(`    public async Task<ActionResult<${entityName}ResponseDto>> GetById(${pkType} id)`);
  lines.push('    {');
  lines.push(`        var item = await _${entityNameCamel}Service.GetByIdAsync(id);`);
  lines.push('        if (item == null)');
  lines.push('        {');
  lines.push(`            _logger.LogWarning("${entityName} with ID {Id} not found", id);`);
  lines.push('            return NotFound();');
  lines.push('        }');
  lines.push('        return Ok(item);');
  lines.push('    }');
  lines.push('');
  
  // POST create
  lines.push('    /// <summary>');
  lines.push(`    /// Create a new ${entityName}`);
  lines.push('    /// </summary>');
  lines.push('    [HttpPost]');
  lines.push(`    [ProducesResponseType(typeof(${entityName}ResponseDto), StatusCodes.Status201Created)]`);
  lines.push('    [ProducesResponseType(StatusCodes.Status400BadRequest)]');
  lines.push(`    public async Task<ActionResult<${entityName}ResponseDto>> Create([FromBody] Create${entityName}Dto dto)`);
  lines.push('    {');
  lines.push('        if (!ModelState.IsValid)');
  lines.push('        {');
  lines.push('            return BadRequest(ModelState);');
  lines.push('        }');
  lines.push('');
  lines.push(`        var item = await _${entityNameCamel}Service.CreateAsync(dto);`);
  lines.push(`        _logger.LogInformation("Created ${entityName} with ID {Id}", item.${pkName});`);
  lines.push(`        return CreatedAtAction(nameof(GetById), new { id = item.${pkName} }, item);`);
  lines.push('    }');
  lines.push('');
  
  // PUT update
  lines.push('    /// <summary>');
  lines.push(`    /// Update an existing ${entityName}`);
  lines.push('    /// </summary>');
  lines.push('    [HttpPut("{id}")]');
  lines.push(`    [ProducesResponseType(typeof(${entityName}ResponseDto), StatusCodes.Status200OK)]`);
  lines.push('    [ProducesResponseType(StatusCodes.Status404NotFound)]');
  lines.push('    [ProducesResponseType(StatusCodes.Status400BadRequest)]');
  lines.push(`    public async Task<ActionResult<${entityName}ResponseDto>> Update(${pkType} id, [FromBody] Update${entityName}Dto dto)`);
  lines.push('    {');
  lines.push('        if (!ModelState.IsValid)');
  lines.push('        {');
  lines.push('            return BadRequest(ModelState);');
  lines.push('        }');
  lines.push('');
  lines.push(`        var item = await _${entityNameCamel}Service.UpdateAsync(id, dto);`);
  lines.push('        if (item == null)');
  lines.push('        {');
  lines.push(`            _logger.LogWarning("${entityName} with ID {Id} not found for update", id);`);
  lines.push('            return NotFound();');
  lines.push('        }');
  lines.push('');
  lines.push(`        _logger.LogInformation("Updated ${entityName} with ID {Id}", id);`);
  lines.push('        return Ok(item);');
  lines.push('    }');
  lines.push('');
  
  // DELETE
  lines.push('    /// <summary>');
  lines.push(`    /// Delete a ${entityName}`);
  lines.push('    /// </summary>');
  lines.push('    [HttpDelete("{id}")]');
  lines.push('    [ProducesResponseType(StatusCodes.Status204NoContent)]');
  lines.push('    [ProducesResponseType(StatusCodes.Status404NotFound)]');
  lines.push(`    public async Task<ActionResult> Delete(${pkType} id)`);
  lines.push('    {');
  lines.push(`        var success = await _${entityNameCamel}Service.DeleteAsync(id);`);
  lines.push('        if (!success)');
  lines.push('        {');
  lines.push(`            _logger.LogWarning("${entityName} with ID {Id} not found for deletion", id);`);
  lines.push('            return NotFound();');
  lines.push('        }');
  lines.push('');
  lines.push(`        _logger.LogInformation("Deleted ${entityName} with ID {Id}", id);`);
  lines.push('        return NoContent();');
  lines.push('    }');
  
  lines.push('}');
  
  return lines;
}

/**
 * Generate controllers for ALL entities
 */
export function generateControllers(model: DataModel): string {
  if (model.entities.length === 0) {
    return '// No entities to generate controllers for';
  }
  
  const namespace = getNamespace(model.name);
  
  const lines: string[] = [];
  
  // Using statements
  lines.push('using Microsoft.AspNetCore.Http;');
  lines.push('using Microsoft.AspNetCore.Mvc;');
  lines.push('using Microsoft.Extensions.Logging;');
  lines.push(`using ${namespace}.DTOs;`);
  lines.push(`using ${namespace}.Services;`);
  lines.push('');
  lines.push(`namespace ${namespace}.Controllers;`);
  lines.push('');
  
  // Generate controller for each entity
  for (let i = 0; i < model.entities.length; i++) {
    const entity = model.entities[i];
    const controllerLines = generateEntityController(entity);
    lines.push(...controllerLines);
    
    if (i < model.entities.length - 1) {
      lines.push('');
    }
  }
  
  return joinLines(lines);
}
