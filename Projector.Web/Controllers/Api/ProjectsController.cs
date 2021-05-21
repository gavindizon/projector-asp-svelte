using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Projector.Core.Projects;
using Projector.Web.Infrastruture;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using WebAPI.Dtos;
using WebAPI.Models;

namespace WebAPI.Controllers
{
    [Area("Api")]
    [Route("[area]/[controller]")]
    [ApiController]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly ProjectorDBContext _context;
        private readonly ProjectService _projects;

        public ProjectsController(ProjectorDBContext context)
        {
            _context = context;
            _projects = new Projector.Core.Projects.ProjectService(context);
        }

        // GET: api/Projects
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
        {
            return await _context.Projects.ToListAsync();
        }

        // GET: api/Projects/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Project>> GetProject(int id)
        {
            var project = await _context.Projects.FindAsync(id);

            if (project == null)
            {
                return NotFound();
            }

            return project;
        }

        [HttpGet("assigned/{id}")]
        public async Task<ActionResult<IEnumerable<Person>>> GetPeopleAssigned(int id)
        {
            var ids = await _context.ProjectAssignments.Where(pa => pa.project_id == id).Select(pa => pa.person_id).ToListAsync();
            return await _context.Persons.Where(p => ids.Contains(p.id)).ToListAsync();
        }


        [HttpDelete("unassign")]
        public async Task<ActionResult<ProjectAssignment>> UnassignPerson(AssignmentDto dto)
        {
            var proj = _context.ProjectAssignments.FirstOrDefault(pa => pa.person_id == dto.person_id && dto.project_id == pa.project_id);

            if (proj == null)
            {
                return NotFound();
            }

            _context.ProjectAssignments.Remove(proj);
            await _context.SaveChangesAsync();
            return proj;

        }

        [HttpPost("assign")]
        public async Task<ActionResult<ProjectAssignment>> AssignPerson(AssignmentDto dto)
        {
            var user = _context.Persons.FirstOrDefault(p => p.id == dto.person_id);
            var project = _context.Projects.FirstOrDefault(p => p.id == dto.project_id);

            ProjectAssignment assignment = new ProjectAssignment
            {
                Project = project,
                Person = user
            };

            _context.ProjectAssignments.Add(assignment);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetProject", new { id = assignment.project_id }, assignment);

        }

        [HttpGet("unassigned/{id}")]
        public async Task<ActionResult<IEnumerable<Person>>> GetUnassigned(int id)
        {
            var ids = await _context.ProjectAssignments.Where(pa => pa.project_id == id).Select(pa => pa.person_id).ToListAsync();
            return await _context.Persons.Where(p => !ids.Contains(p.id)).ToListAsync();
        }


        // PUT: api/Projects/5
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProject(int id, Project project)
        {
            if (id != project.id){
                return BadRequest();
            }

            _context.Entry(project).State = EntityState.Modified;

            try{
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProjectExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Projects
        [HttpPost]
        //[UserIdentityPropertySetterFilter]
        public async Task<ActionResult<ProjectData>> PostProject(CreateProjectCommand args)
        {
            // controllers have 3 responsibilities:
            // 1) accept the request, validate it
            // 2) locate the proper model to execute, execute, handle errors
            // 3) return a response depending on the state of the model

            if (this.ModelState.IsValid)
            {
                args.createdBy = User.Identity.Name;

                return this.CreatedAtAction("GetMyProjects", _projects.CreateProject(args));
            }
            else
            {
                return this.BadRequest(this.ModelState);
            }
        }
 
        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<IEnumerable<Project>>> GetMyProjects()
        {
            var userid = ((ClaimsIdentity)User.Identity).FindFirst("Id").Value.ToString();
            var user = _context.Persons.FirstOrDefault(p => p.id == int.Parse(userid));
            var myProjectIds = await _context.ProjectAssignments.Where(pa => pa.Person.id == user.id).Select(pa => pa.Project.id).ToListAsync();

            return await _context.Projects.Where(p => myProjectIds.Contains(p.id)).ToListAsync();

        }


        // DELETE: api/Projects/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<Project>> DeleteProject(int id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null)
            {
                return NotFound();
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return project;
        }

        [HttpDelete]
        public async Task<ActionResult<Project>> DeleteProjects()
        {

            foreach (var project in _context.Projects)
                _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return NoContent();
        }


        private bool ProjectExists(int id)
        {
            return _context.Projects.Any(e => e.id == id);
        }
    }
}
