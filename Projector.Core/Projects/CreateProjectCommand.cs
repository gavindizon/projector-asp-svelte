using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Projector.Core.Projects
{
    public class CreateProjectCommand
    {
        [Required]
        [StringLength(50)]
        public string code { get; set; }

        [StringLength(50)]
        public string name { get; set; }

        public string remarks { get; set; }

        public decimal budget { get; set; }

        public string createdBy { get; set; }
    }
}
