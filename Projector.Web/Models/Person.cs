using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace WebAPI.Models
{
    public class Person
    {
        public Person()
        {
            //this.Projects = new List<Project>();
        }

        [Key]
        public int id { get; set; }
        [Column(TypeName = "nvarchar(50)")]
        public string last_name { get; set; }
        [Column(TypeName = "nvarchar(50)")]
        public string first_name { get; set; }
        [Column(TypeName = "nvarchar(50)")]
        [EmailAddress(ErrorMessage = "Invalid Email Address")]
        public string username { get; set; }// email
        [Column(TypeName = "nvarchar(50)")]
        public string password { get; set; }

//        public virtual List<Project> Projects {get;set; }
    }
}
