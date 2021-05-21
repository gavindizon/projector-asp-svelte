﻿// <auto-generated />
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using WebAPI.Models;

namespace Projector.Web.Migrations
{
    [DbContext(typeof(ProjectorDBContext))]
    [Migration("20210517025349_init")]
    partial class init
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("ProductVersion", "5.0.6")
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("WebAPI.Models.Person", b =>
                {
                    b.Property<int>("id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("first_name")
                        .HasColumnType("nvarchar(50)");

                    b.Property<string>("last_name")
                        .HasColumnType("nvarchar(50)");

                    b.Property<string>("password")
                        .HasColumnType("nvarchar(50)");

                    b.Property<string>("username")
                        .HasColumnType("nvarchar(50)");

                    b.HasKey("id");

                    b.ToTable("Persons");
                });

            modelBuilder.Entity("WebAPI.Models.Project", b =>
                {
                    b.Property<int>("id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<decimal>("budget")
                        .HasColumnType("decimal(18,4)");

                    b.Property<string>("code")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("nvarchar(50)");

                    b.Property<string>("name")
                        .HasColumnType("nvarchar(50)");

                    b.Property<string>("remarks")
                        .HasColumnType("nvarchar(MAX)");

                    b.HasKey("id");

                    b.ToTable("Projects");
                });

            modelBuilder.Entity("WebAPI.Models.ProjectAssignment", b =>
                {
                    b.Property<int>("person_id")
                        .HasColumnType("int");

                    b.Property<int>("project_id")
                        .HasColumnType("int");

                    b.HasKey("person_id", "project_id");

                    b.HasIndex("project_id");

                    b.ToTable("ProjectAssignments");
                });

            modelBuilder.Entity("WebAPI.Models.ProjectAssignment", b =>
                {
                    b.HasOne("WebAPI.Models.Person", "Person")
                        .WithMany()
                        .HasForeignKey("person_id")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("WebAPI.Models.Project", "Project")
                        .WithMany()
                        .HasForeignKey("project_id")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Person");

                    b.Navigation("Project");
                });
#pragma warning restore 612, 618
        }
    }
}
