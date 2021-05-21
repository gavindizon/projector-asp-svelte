using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Models
{
    public class ProjectorDBContext : DbContext
    {
        public ProjectorDBContext(DbContextOptions<ProjectorDBContext> options):base(options){

        }

        public DbSet<Person> Persons { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectAssignment> ProjectAssignments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // add decimal precision 5
            modelBuilder.Entity<ProjectAssignment>().HasKey(l => new { l.person_id, l.project_id });
        }
    }
}
