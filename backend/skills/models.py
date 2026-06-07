from django.db import models


class SkillCategory(models.TextChoices):
    ACADEMIC = "academic", "Academic"
    VOCATIONAL = "vocational", "Vocational"
    TECH = "tech", "Tech"
    OTHER = "other", "Other"


class Skill(models.Model):
    name = models.CharField(max_length=120, unique=True)
    category = models.CharField(max_length=32, choices=SkillCategory.choices, default=SkillCategory.OTHER)
    description = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name
