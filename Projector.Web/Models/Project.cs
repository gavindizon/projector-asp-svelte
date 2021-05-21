using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Models
{
    public class Project
    {
        public Project()
        {
          //  this.AssignedPeople = new List<Person>();
        }
        [Key]
        public int id { get; set; }
        [StringLength(50)]
        [Required]
        public string code { get; set; }
        [Column(TypeName = "nvarchar(50)")]
        public string name { get; set; }
        [Column(TypeName = "nvarchar(MAX)")]
        public string remarks { get; set; }
        [Column(TypeName = "decimal(18,4)")]
        public decimal budget { get; set; }

     //   public virtual List<Person> AssignedPeople { get; set; }
    }
}
