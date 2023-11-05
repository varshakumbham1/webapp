packer {
  required_plugins {
    amazon = {
      source  = "github.com/hashicorp/amazon"
      version = ">= 1.0.0"
    }
  }
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "aws_profile" {
  type    = string
  default = "github_user"
}

variable "source_ami" {
  type    = string
  default = "ami-06db4d78cb1d3bbf9"
}

variable "ssh_username" {
  type    = string
  default = "admin"
}

variable "subnet_id" {
  type    = string
  default = "subnet-0a48a5291be72d163"
}

variable "ami_users" {
  type    = list(string)
  default = ["851715934935"]
}

variable "ami_regions" {
  type = list(string)
  default = [
    "us-east-1",
  ]
}

variable "instance_type" {
  type    = string
  default = "t2.micro"
}

# https://www.packer.io/plugins/builders/amazon/ebs
source "amazon-ebs" "my-ami" {
  region          = "${var.aws_region}"
  ami_name        = "csye6225_${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
  ami_description = "AMI for CSYE 6225"
  ami_regions     = "${var.ami_regions}"
  profile         = "${var.aws_profile}"
  ami_users       = "${var.ami_users}"
  aws_polling {
    delay_seconds = 120
    max_attempts  = 50
  }

  instance_type    = "${var.instance_type}"
  source_ami       = "${var.source_ami}"
  ssh_username     = "${var.ssh_username}"
  subnet_id        = "${var.subnet_id}"
  force_deregister = true

  launch_block_device_mappings {
    delete_on_termination = true
    device_name           = "/dev/xvda"
    volume_size           = 8
    volume_type           = "gp2"
  }
}

build {
  sources = ["source.amazon-ebs.my-ami"]
  provisioner "shell" {
    inline = [
      "sudo groupadd csye6225",
      "sudo useradd -s /bin/false -g csye6225 -d /opt/csye6225 -m csye6225",
      "mkdir -p ~/webapp/dist",
      "sudo apt update",
      "sudo apt install -y nodejs npm",
    ]
  }
  provisioner "file" {
    // source      = ".env"
    source      = fileexists(".env") ? ".env" : "/"
    destination = "/home/admin/webapp/.env"
  }
  provisioner "file" {
    // source      = "dist/main.js"
    source      = fileexists("dist/main.js") ? "dist/main.js" : "/"
    destination = "/home/admin/webapp/dist/main.js"
  }
  provisioner "file" {
    source      = "package.json"
    destination = "/home/admin/webapp/package.json"
  }
  provisioner "file" {
    source      = "Users.csv"
    destination = "/home/admin/webapp/Users.csv"
  }
  provisioner "file" {
    source      = "webapp.service"
    destination = "/home/admin/webapp/webapp.service"
  }
  provisioner "file" {
    source      = "cloud-watch-config.json"
    destination = "/tmp/cloudwatch-agent-config.json"
  }
  provisioner "shell" {
    inline = [
      "cd /home/admin/webapp && npm install",
      "sudo mv /home/admin/webapp/webapp.service /etc/systemd/system/",
      "sudo mv /home/admin/webapp/Users.csv /opt/",
      "sudo mv /home/admin/webapp /opt/csye6225/",
      "sudo chown -R csye6225:csye6225 /opt/",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable webapp",
      "sudo systemctl start webapp",
      "wget https://amazoncloudwatch-agent.s3.amazonaws.com/debian/amd64/latest/amazon-cloudwatch-agent.deb",
      "sudo dpkg -i -E ./amazon-cloudwatch-agent.deb",
      "sudo mv /tmp/cloudwatch-agent-config.json /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json",
      "sudo systemctl enable amazon-cloudwatch-agent",
      "sudo systemctl start amazon-cloudwatch-agent"
    ]
  }
}