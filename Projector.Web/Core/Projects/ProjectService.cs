using System;
using System.Linq;
using System.Threading.Tasks;
using WebAPI.Models;

namespace Projector.Core.Projects
{
    public class ProjectService
    {
        private ProjectorDBContext _context;

        public ProjectService(ProjectorDBContext context)
        {
            _context = context;
        }

        public async Task<ProjectData> CreateProject(CreateProjectCommand args)
        {
            var user = _context.Persons.FirstOrDefault(p => p.username == args.createdBy);
            var projectEntity = _context.Projects.Add(new Project
            {
                code = args.code,
                name = args.name,
                remarks = args.remarks,
                budget = args.budget
            }).Entity;

            ProjectAssignment assignment = new ProjectAssignment
            {
                Project = projectEntity,
                Person = user
            };

            _context.ProjectAssignments.Add(assignment);
            await _context.SaveChangesAsync();

            return new ProjectData
            {
                id = projectEntity.id,
                name = projectEntity.name,
                remarks = projectEntity.remarks,
                code = projectEntity.code,
                budget = projectEntity.budget
            };
        }
    }
}
